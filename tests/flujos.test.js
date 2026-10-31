// Tests de integración de los flujos de negocio contra una MongoDB en memoria (replica set,
// necesaria para las transacciones). Ejecutar con: npm test
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'secreto-de-test';
process.env.ROUTE = '';
process.env.NODE_ENV = 'test';

const app = require('../app');
const Producto = require('../models/producto_Model');
const Cliente = require('../models/cliente_Model');
const Caja = require('../models/caja_Model');
const ComprobanteVenta = require('../models/clienteComprobanteVenta_Model');
require('../models/productoVino_Model');
require('../models/productoPicada_Model');
require('../models/productoInsumo_Model');

let replSet;
let tokenAdmin;
let tokenCliente;

const raw = (nombre) => mongoose.connection.collection(nombre);
const api = (metodo, ruta, token = tokenAdmin) =>
  request(app)[metodo](ruta).set('Authorization', `Bearer ${token}`);

const stock = async (id) => (await Producto.findById(id).lean()).stock;
const saldo = async (id) => (await Cliente.findById(id).lean()).saldoActualCuentaCorriente;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replSet.getUri());
  // Crea colecciones e índices antes de usarlos dentro de transacciones.
  await Promise.all(Object.values(mongoose.models).map(m => m.createCollection().then(() => m.syncIndexes())));

  await raw('Usuario').insertMany([
    { _id: 1, name: 'admin', password: 'x', rol: 'administrador', estado: true },
    { _id: 2, name: 'tienda', password: 'x', rol: 'cliente', cliente: 1, estado: true },
  ]);
  tokenAdmin = jwt.sign({ id: 1, rol: 'administrador' }, process.env.JWT_SECRET);
  tokenCliente = jwt.sign({ id: 2, rol: 'cliente' }, process.env.JWT_SECRET);

  await raw('Cliente').insertMany([
    { _id: 1, name: 'Ana', lastname: 'A', cuit: '20-1', cuentaCorriente: true, saldoCuentaCorriente: 1000, saldoActualCuentaCorriente: 1000, estado: true },
    { _id: 2, name: 'Beto', lastname: 'B', cuit: '20-2', cuentaCorriente: true, saldoCuentaCorriente: 1000, saldoActualCuentaCorriente: 1000, estado: true },
  ]);
  await raw('MedioPago').insertMany([
    { _id: 1, name: 'Efectivo', estado: true },
    { _id: 2, name: 'Cuenta Corriente', estado: true },
  ]);
  await raw('Empleado').insertOne({ _id: 1, name: 'Vendedor', estado: true });
  await raw('Producto').insertMany([
    // Vino: precio = 100 + 50% = 150
    { _id: 10, name: 'Malbec', stock: 5, tipoProducto: 'ProductoVino', __t: 'ProductoVino', precioCosto: 100, ganancia: 50, estado: true },
    { _id: 11, name: 'Último', stock: 1, tipoProducto: 'ProductoVino', __t: 'ProductoVino', precioCosto: 100, ganancia: 0, estado: true },
    { _id: 20, name: 'Picada', stock: 0, tipoProducto: 'ProductoPicada', __t: 'ProductoPicada', precioVenta: 500, estado: true },
    { _id: 21, name: 'Queso', stock: 10, tipoProducto: 'ProductoInsumo', __t: 'ProductoInsumo', precioCosto: 10, ganancia: 0, estado: true },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

const nuevaNota = (overrides = {}) => ({
  cliente: 1, empleado: 1, medioPago: 2, fechaEntrega: '2026-11-15', envio: false,
  detalles: [{ producto: 10, cantidad: 2 }], total: 300, ...overrides,
});

describe('Seguridad', () => {
  test('sin token: 401; el switch de BD ya no existe', async () => {
    expect((await request(app).get('/gestion/caja')).status).toBe(401);
    expect((await api('post', '/ping/switchDb').send({ target: 'dev' })).status).toBe(404);
  });

  test('un cliente de la tienda no accede a la gestión ni crea usuarios', async () => {
    expect((await api('get', '/gestion/caja', tokenCliente)).status).toBe(403);
    expect((await api('post', '/usuario', tokenCliente).send({ name: 'x', password: 'x', rol: 'administrador' })).status).toBe(403);
    expect((await api('get', '/products/productFoto/catalogo', tokenCliente)).status).toBe(200);
  });

  test('login rechaza operadores de MongoDB', async () => {
    const res = await request(app).post('/usuario/login').send({ usuario: { $ne: null }, password: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('Ventas: nota de pedido, factura, remito', () => {
  let notaID;
  let comprobanteID;

  test('crea la nota con precios del servidor, descuenta stock y Cuenta Corriente', async () => {
    const res = await api('post', '/cliente/notaPedido').send(nuevaNota());
    expect(res.status).toBe(201);
    notaID = res.body.data._id;
    expect(res.body.data.total).toBe(300);
    expect(await stock(10)).toBe(3);
    expect(await saldo(1)).toBe(700);
    const caja = await Caja.find({ 'origen.tipo': 'NOTA_PEDIDO', 'origen.id': notaID }).lean();
    expect(caja).toHaveLength(1);
    expect(caja[0]).toMatchObject({ tipo: 'CUENTA_CORRIENTE', total: 300, persona: 1 });
  });

  test('rechaza un total que difiere más del 5% del calculado y cantidades inválidas', async () => {
    expect((await api('post', '/cliente/notaPedido').send(nuevaNota({ total: 100 }))).status).toBe(400);
    expect((await api('post', '/cliente/notaPedido').send(nuevaNota({ total: 290, detalles: [{ producto: 10, cantidad: -2 }] }))).status).toBe(400);
    expect(await stock(10)).toBe(3);
  });

  test('acepta un ajuste por redondeo dentro del 5%', async () => {
    const res = await api('post', '/cliente/notaPedido').send(nuevaNota({ medioPago: 1, detalles: [{ producto: 10, cantidad: 1 }], total: 145 }));
    expect(res.status).toBe(201);
    expect(res.body.data.total).toBe(145);
    await api('delete', `/cliente/notaPedido/${res.body.data._id}`);
    expect(await stock(10)).toBe(3);
  });

  test('factura una sola vez, con el total de la nota', async () => {
    const res = await api('post', '/cliente/comprobanteVenta').send({ tipoComprobante: '1', notaPedido: notaID, total: 1 });
    expect(res.status).toBe(201);
    comprobanteID = res.body.data._id;
    expect(res.body.data.total).toBe(300);
    const segunda = await api('post', '/cliente/comprobanteVenta').send({ tipoComprobante: '1', notaPedido: notaID });
    expect(segunda.status).toBe(409);
    expect(await ComprobanteVenta.countDocuments({ notaPedido: notaID, estado: true })).toBe(1);
  });

  test('una nota facturada no se puede modificar aunque el body diga facturado:false', async () => {
    const res = await api('put', `/cliente/notaPedido/${notaID}`).send(nuevaNota({ facturado: false, total: 150, detalles: [{ producto: 10, cantidad: 1 }] }));
    expect(res.status).toBe(409);
    expect(await stock(10)).toBe(3);
  });

  test('el remito queda vinculado al comprobante, uno por factura, y al anularlo se libera', async () => {
    const body = { totalPrecio: 300, totalBultos: 1, comprobanteVenta: comprobanteID, transporteID: 1, detalles: [{ producto: 10, cantidad: 2 }] };
    const res = await api('post', '/cliente/remito').send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.comprobanteVentaID).toBe(comprobanteID);
    expect((await api('post', '/cliente/remito').send(body)).status).toBe(409);
    expect((await api('delete', `/cliente/comprobanteVenta/${comprobanteID}`)).status).toBe(409);
    expect((await api('delete', `/cliente/remito/${res.body.data._id}`)).status).toBe(200);
    expect((await ComprobanteVenta.findById(comprobanteID).lean()).remitoCreado).toBe(false);
  });

  test('cambiar el cliente de una nota en CC y eliminarla deja ambos saldos correctos', async () => {
    const creada = await api('post', '/cliente/notaPedido').send(nuevaNota({ detalles: [{ producto: 10, cantidad: 1 }], total: 150 }));
    expect(creada.status).toBe(201);
    const id = creada.body.data._id;
    expect(await saldo(1)).toBe(550);

    const editada = await api('put', `/cliente/notaPedido/${id}`).send(nuevaNota({ cliente: 2, detalles: [{ producto: 10, cantidad: 1 }], total: 150 }));
    expect(editada.status).toBe(200);
    expect(await saldo(1)).toBe(700);
    expect(await saldo(2)).toBe(850);

    expect((await api('delete', `/cliente/notaPedido/${id}`)).status).toBe(200);
    expect(await saldo(1)).toBe(700);
    expect(await saldo(2)).toBe(1000);
    expect(await stock(10)).toBe(3);
  });

  test('dos ventas simultáneas del último producto: solo una se concreta', async () => {
    const body = nuevaNota({ medioPago: 1, detalles: [{ producto: 11, cantidad: 1 }], total: 100 });
    const [a, b] = await Promise.all([
      api('post', '/cliente/notaPedido').send(body),
      api('post', '/cliente/notaPedido').send(body),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 400]);
    expect(await stock(11)).toBe(0);
  });
});

describe('Recibo de pago', () => {
  test('crear, editar y anular mantiene saldo y caja consistentes', async () => {
    expect(await saldo(1)).toBe(700);
    const creado = await api('post', '/cliente/reciboPago').send({ total: 200, clienteID: 1, medioPagoID: 1 });
    expect(creado.status).toBe(201);
    const id = creado.body.data._id;
    expect(await saldo(1)).toBe(900);

    expect((await api('put', `/cliente/reciboPago/${id}`).send({ total: 100, clienteID: 1, medioPagoID: 1 })).status).toBe(200);
    // Guardar de nuevo sin cambios no debe generar otro ajuste.
    expect((await api('put', `/cliente/reciboPago/${id}`).send({ total: 100, clienteID: 1, medioPagoID: 1 })).status).toBe(200);
    expect(await saldo(1)).toBe(800);
    const movs = await Caja.find({ 'origen.tipo': 'RECIBO_PAGO', 'origen.id': id, estado: true }).lean();
    const neto = movs.reduce((acc, m) => (m.tipo === 'SALIDA' ? acc - m.total : acc + m.total), 0);
    expect(neto).toBe(100);
    expect(movs).toHaveLength(2);

    expect((await api('delete', `/cliente/reciboPago/${id}`)).status).toBe(200);
    expect(await saldo(1)).toBe(700);
    expect(await Caja.countDocuments({ 'origen.tipo': 'RECIBO_PAGO', 'origen.id': id, estado: true })).toBe(0);
  });

  test('no permite superar el límite ni totales negativos', async () => {
    expect((await api('post', '/cliente/reciboPago').send({ total: 400, clienteID: 1, medioPagoID: 1 })).status).toBe(400);
    expect((await api('post', '/cliente/reciboPago').send({ total: -50, clienteID: 1, medioPagoID: 1 })).status).toBe(400);
    expect(await saldo(1)).toBe(700);
  });
});

describe('Producción', () => {
  test('finalizar una orden dos veces no duplica el stock', async () => {
    await raw('ProductoPicadaDetalle').insertOne({ _id: 1, picada: 20, insumo: 21, cantidad: 2, estado: true });
    await raw('OrdenProduccion').insertOne({ _id: 1, fecha: new Date(), empleado: 1, estado: true, estadoProduccion: false });
    await raw('OrdenProduccionDetalle').insertOne({ _id: 1, ordenProduccion: 1, picada: 20, cantidad: 3, estado: true });

    const [a, b] = await Promise.all([
      api('put', '/products/ordenProduccion/finalizar/1'),
      api('put', '/products/ordenProduccion/finalizar/1'),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect(await stock(20)).toBe(3);
    expect(await stock(21)).toBe(4);
  });
});

describe('Compras: remito de proveedor', () => {
  test('no recibe más de lo facturado y al anular devuelve el stock', async () => {
    await raw('Proveedor_ComprobanteCompra').insertOne({ _id: 1, ordenCompra: 1, total: 400, fecha: new Date(), estado: true });
    await raw('Proveedor_ComprobanteCompraDetalle').insertOne({ _id: 1, comprobanteCompra: 1, producto: 10, cantidad: 5, precio: 80, importe: 400, estado: true });
    const base = { totalPrecio: 160, totalBultos: 1, comprobanteCompra: 1, transporte: 1 };

    const antes = await stock(10);
    const ok = await api('post', '/proveedor/remito').send({ ...base, detalles: [{ producto: 10, cantidad: 2 }] });
    expect(ok.status).toBe(201);
    expect(await stock(10)).toBe(antes + 2);
    expect((await Producto.findById(10).lean()).precioCosto).toBe(80);

    const demasiado = await api('post', '/proveedor/remito').send({ ...base, detalles: [{ producto: 10, cantidad: 4 }] });
    expect(demasiado.status).toBe(400);

    expect((await api('delete', `/proveedor/remito/${ok.body.data._id}`)).status).toBe(200);
    expect(await stock(10)).toBe(antes);
  });
});
