/**
 * Chequeo previo al despliegue. SOLO LECTURA: no modifica ningún documento ni índice.
 *
 * Lista los datos que impedirían crear los índices únicos nuevos o que conviene revisar a mano
 * (según lo acordado, no hay scripts de reparación: cada caso se decide manualmente).
 *
 * Uso:
 *   node scripts/chequeoPreDespliegue.js              (base de MONGODB_URI)
 *   node scripts/chequeoPreDespliegue.js Vinoteca     (otra base del mismo cluster)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { leerCuit } = require('../utils/cuit');

const duplicados = (coleccion, campo, filtro = {}) =>
  mongoose.connection.db.collection(coleccion).aggregate([
    { $match: { ...filtro, [campo]: { $ne: null } } },
    { $group: { _id: `$${campo}`, ids: { $push: '$_id' }, cantidad: { $sum: 1 } } },
    { $match: { cantidad: { $gt: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();

const nombresIndices = async (coleccion) =>
  (await mongoose.connection.db.collection(coleccion).indexes()).map((i) => i.name);

const MAX_FILAS = 15;

const informar = (titulo, filas, explicacion) => {
  console.log(`\n${filas.length ? '⚠️ ' : '✔️ '} ${titulo}: ${filas.length}`);
  if (filas.length) {
    console.log(`   ${explicacion}`);
    filas.slice(0, MAX_FILAS).forEach((f) => console.log(`   - ${JSON.stringify(f)}`));
    if (filas.length > MAX_FILAS) console.log(`   ... y ${filas.length - MAX_FILAS} más`);
  }
};

async function chequear() {
  const dbName = process.argv[2];
  await mongoose.connect(process.env.MONGODB_URI, dbName ? { dbName, autoIndex: false } : { autoIndex: false });
  const db = mongoose.connection.db;
  console.log(`Base: ${db.databaseName} (solo lectura)`);

  // 1. Índice único notaPedido_unico_activo: una nota con más de un comprobante activo lo bloquea.
  informar(
    'Notas de pedido con más de un comprobante de venta activo',
    await duplicados('Cliente_ComprobanteVenta', 'notaPedido', { estado: true }),
    'Bloquean el índice único. Anular a mano el comprobante que sobra en cada nota.'
  );

  // 2. CUIT: solo los CUIT reales (11 dígitos, verificador correcto) tienen que ser únicos.
  //    Los vacíos o de relleno se permiten. Un CUIT real repetido no deja editar esos clientes
  //    hasta corregirlo a mano.
  const porCuit = new Map();
  for (const c of await db.collection('Cliente').find({}, { projection: { cuit: 1, estado: 1 } }).toArray()) {
    const numero = leerCuit(c.cuit)?.cuitNumero;
    if (numero) porCuit.set(numero, [...(porCuit.get(numero) || []), c._id]);
  }
  informar(
    'CUIT reales repetidos en clientes',
    [...porCuit].filter(([, ids]) => ids.length > 1).map(([cuit, ids]) => ({ cuit, ids })),
    'Corregir a mano: mientras sigan repetidos, editar esos clientes responde "Ya existe un registro con ese CUIT".'
  );

  // 3. Desde ahora solo se permite un remito activo por comprobante; los viejos pueden tener varios.
  informar(
    'Comprobantes de venta con más de un remito activo',
    await duplicados('Cliente_Remito', 'comprobanteVentaID', { estado: true }),
    'No bloquean nada, pero conviene revisar si alguno sobra.'
  );
  informar(
    'Comprobantes de compra con más de un remito de proveedor activo',
    await duplicados('Proveedor_Remito', 'comprobanteCompra', { estado: true }),
    'Cada remito sumó stock: revisar si el stock de esos productos quedó inflado.'
  );

  // 4. Remitos de cliente viejos: el vínculo con la factura nunca se guardó.
  const remitosSinComprobante = await db.collection('Cliente_Remito')
    .find({ estado: true, comprobanteVentaID: { $in: [null, ''] } }, { projection: { _id: 1, fecha: 1 } })
    .toArray();
  informar(
    'Remitos de cliente activos sin comprobante de venta vinculado',
    remitosSinComprobante,
    'Remitos emitidos antes de la corrección. Quedan sin vínculo; no se corrige por código.'
  );

  // 5. Stock negativo (no debería existir con el $inc condicional, pero puede venir de antes).
  informar(
    'Productos activos con stock negativo',
    await db.collection('Producto').find({ estado: true, stock: { $lt: 0 } }, { projection: { _id: 1, name: 1, stock: 1 } }).toArray(),
    'Corregir con un ajuste de stock (administrador).'
  );

  // 6. Índices únicos ya creados (si faltan, se crean al arrancar el servidor; con duplicados, fallan).
  console.log('\nÍndices únicos presentes:');
  const comprobante = await nombresIndices('Cliente_ComprobanteVenta');
  const cliente = await nombresIndices('Cliente');
  const estado = (presente) => (presente ? 'sí' : 'no (se intenta crear al arrancar; falla si hay duplicados)');
  console.log(`   notaPedido_unico_activo: ${estado(comprobante.includes('notaPedido_unico_activo'))}`);
  console.log(`   cuitNumero_unico: ${estado(cliente.includes('cuitNumero_unico'))}`);
  if (cliente.includes('cuit_1')) {
    console.log('   ⚠️  Existe el índice viejo cuit_1 (único sobre el texto): borrarlo con db.Cliente.dropIndex("cuit_1").');
  }

  await mongoose.disconnect();
}

chequear().catch((err) => {
  console.error('❌ Error en el chequeo:', err.message);
  process.exit(1);
});
