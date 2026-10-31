const Presupuesto = require("../models/clientePresupuesto_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");
const Producto = require("../models/producto_Model");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');
const { httpError, round2 } = require('../utils/http');
const { validarCantidad } = require('../utils/stock');
const { calcularPrecioProducto, validarTotalConAjuste } = require('../utils/precios');
const { validarDiasValidez, calcularVencimiento, estaVigente } = require('../utils/presupuesto');

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

// Un presupuesto con una nota de pedido ACTIVA ya no se puede modificar ni eliminar.
const tieneNotaActiva = (presupuestoID, session = null) =>
  NotaPedido.exists({ presupuesto: presupuestoID, estado: true }).session(session);

// Guarda las líneas de un presupuesto reservando un bloque de IDs (una sola consulta al contador).
const guardarDetallesPresupuesto = async ({ lineas, presupuestoID, session }) => {
  const primerId = await getNextSequence("Cliente_PresupuestoDetalle", session, lineas.length);
  const docs = lineas.map((l, i) => ({ _id: primerId + i, ...l, presupuesto: presupuestoID, estado: true }));
  await PresupuestoDetalle.insertMany(docs, { session });
};

// Valida las líneas cargadas por el vendedor. El precio es editable (precio especial, redondeo),
// pero el importe y el total se calculan en el servidor. El presupuesto NO exige stock:
// solo devuelve avisos; el stock se controla al pasar a nota de pedido.
const prepararLineas = async (detalles, session) => {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw httpError(400, "❌ El presupuesto debe tener al menos un detalle.");
  }

  const ids = detalles.map(d => Number(d.producto));
  const productos = await Producto.find({ _id: { $in: ids }, estado: true }).session(session).lean();
  const productosPorId = new Map(productos.map(p => [p._id, p]));

  const avisos = [];
  let totalCalculado = 0;
  const lineas = detalles.map((det) => {
    const producto = productosPorId.get(Number(det.producto));
    if (!producto) throw httpError(400, `❌ Producto no encontrado o inactivo (ID ${det.producto}).`);

    const cantidad = validarCantidad(det.cantidad);
    const precio = round2(Number(det.precio));
    if (!Number.isFinite(precio) || precio <= 0) {
      throw httpError(400, `❌ El precio de ${producto.name} debe ser mayor a 0.`);
    }
    if (producto.stock < cantidad) {
      avisos.push(`${producto.name}: se presupuestan ${cantidad} y hay ${producto.stock} en stock.`);
    }

    const importe = round2(precio * cantidad);
    totalCalculado += importe;
    return { producto: producto._id, cantidad, precio, precioLista: calcularPrecioProducto(producto), importe };
  });

  return { lineas, totalCalculado: round2(totalCalculado), avisos };
};

const setPresupuesto = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let presupuesto;
    let avisos;
    await session.withTransaction(async () => {
      const { cliente, empleado, detalles } = req.body;
      if (!cliente || !empleado) {
        throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
      }

      const preparado = await prepararLineas(detalles, session);
      avisos = preparado.avisos;
      const total = validarTotalConAjuste(req.body.total, preparado.totalCalculado);

      const fecha = obtenerFechaHoy();
      const diasValidez = validarDiasValidez(req.body.diasValidez);
      const _id = await getNextSequence("Cliente_Presupuesto", session);
      [presupuesto] = await Presupuesto.create([{
        _id, total, fecha, cliente, empleado, estado: true,
        diasValidez, fechaVencimiento: calcularVencimiento(fecha, diasValidez),
      }], { session });

      await guardarDetallesPresupuesto({ lineas: preparado.lineas, presupuestoID: _id, session });
    });

    return res.status(201).json({
      ok: true,
      message: "✔️ Presupuesto agregado correctamente",
      data: presupuesto,
      avisos,
    });
  } catch (error) {
    responderError(res, error);
  } finally {
    session.endSession();
  }
};

const getPresupuesto = async (req, res) => {
  try {
    const [presupuestos, conNota] = await Promise.all([
      Presupuesto.find({ estado: true }).lean(),
      NotaPedido.distinct('presupuesto', { estado: true, presupuesto: { $ne: null } }),
    ]);
    const presupuestosConNota = new Set(conNota.map(Number));

    res.status(200).json({
      ok: true,
      data: presupuestos.map(p => ({
        ...p,
        tieneNotaPedido: presupuestosConNota.has(p._id),
        vigente: estaVigente(p),
      })),
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno al obtener presupuestos." });
  }
};

const getPresupuestoID = async (req, res) => {
  const presupuesto = await Presupuesto.findById(req.params.id).lean();
  if (!presupuesto) {
    return res.status(404).json({ ok: false, message: '❌ El id no corresponde a un presupuesto.' });
  }
  res.status(200).json({
    ok: true,
    data: { ...presupuesto, vigente: estaVigente(presupuesto) },
    message: "✔️ Presupuesto obtenido correctamente."
  });
};

// Líneas listas para cargar en una nota de pedido:
// - cantidad = mínimo entre lo presupuestado y el stock real (nunca se vende lo que no hay);
// - precio = el negociado si el presupuesto está vigente, o el de lista actual si venció.
// Es la misma regla que aplica el servidor al guardar la nota.
const getPresupuestoParaNota = async (req, res) => {
  const presupuesto = await Presupuesto.findOne({ _id: req.params.id, estado: true }).lean();
  if (!presupuesto) {
    return res.status(404).json({ ok: false, message: '❌ El presupuesto no existe o fue eliminado.' });
  }
  if (await tieneNotaActiva(presupuesto._id)) {
    return res.status(409).json({ ok: false, message: `❌ El presupuesto N° ${presupuesto._id} ya tiene una nota de pedido.` });
  }

  const vigente = estaVigente(presupuesto);
  const detalles = await PresupuestoDetalle.find({ presupuesto: presupuesto._id, estado: true }).lean();
  const productos = await Producto.find({ _id: { $in: detalles.map(d => d.producto) } }).lean();
  const productosPorId = new Map(productos.map(p => [p._id, p]));

  const avisos = [];
  if (!vigente) avisos.push('El presupuesto está vencido: se usan los precios actuales.');

  const lineas = detalles.map((d) => {
    const producto = productosPorId.get(d.producto);
    const activo = !!producto && producto.estado !== false;
    const stockDisponible = activo ? Math.max(producto.stock, 0) : 0;
    const cantidad = Math.min(d.cantidad, stockDisponible);
    const precio = vigente ? d.precio : (activo ? calcularPrecioProducto(producto) : d.precio);

    if (!activo) avisos.push(`${producto?.name || `Producto ${d.producto}`}: ya no está activo, no se carga.`);
    else if (cantidad === 0) avisos.push(`${producto.name}: sin stock, no se carga.`);
    else if (cantidad < d.cantidad) avisos.push(`${producto.name}: se presupuestaron ${d.cantidad}, se cargan ${cantidad} (stock disponible).`);

    return {
      producto: d.producto,
      nombre: producto?.name || null,
      cantidadPresupuestada: d.cantidad,
      stockDisponible,
      cantidad,
      precio,
      importe: round2(precio * cantidad),
      cargar: activo && cantidad > 0,
    };
  });

  const total = round2(lineas.filter(l => l.cargar).reduce((acc, l) => acc + l.importe, 0));
  res.status(200).json({
    ok: true,
    data: {
      presupuesto: {
        _id: presupuesto._id,
        cliente: presupuesto.cliente,
        empleado: presupuesto.empleado,
        fecha: presupuesto.fecha,
        fechaVencimiento: presupuesto.fechaVencimiento || null,
        vigente,
      },
      detalles: lineas,
      total,
    },
    avisos,
  });
};

const updatePresupuesto = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let presupuesto;
    let avisos;
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      const { cliente, empleado, detalles } = req.body;

      const actual = await Presupuesto.findOne({ _id: id, estado: true }).session(session).lean();
      if (!actual) throw httpError(404, "❌ El presupuesto no existe o fue eliminado.");
      if (await tieneNotaActiva(id, session)) {
        throw httpError(409, "❌ El presupuesto ya se encuentra en una nota de pedido y no puede modificarse.");
      }
      if (!cliente || !empleado) {
        throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
      }

      const preparado = await prepararLineas(detalles, session);
      avisos = preparado.avisos;
      const total = validarTotalConAjuste(req.body.total, preparado.totalCalculado);

      // La fecha no cambia: la validez siempre se cuenta desde la fecha original.
      const diasValidez = req.body.diasValidez != null
        ? validarDiasValidez(req.body.diasValidez)
        : (actual.diasValidez ?? validarDiasValidez());

      presupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        { total, cliente, empleado, diasValidez, fechaVencimiento: calcularVencimiento(actual.fecha, diasValidez) },
        { new: true, runValidators: true, session }
      );

      await PresupuestoDetalle.updateMany({ presupuesto: id, estado: true }, { estado: false }, { session });
      await guardarDetallesPresupuesto({ lineas: preparado.lineas, presupuestoID: id, session });
    });

    res.status(200).json({
      ok: true,
      data: presupuesto,
      avisos,
      message: '✔️ Presupuesto actualizado correctamente.',
    });
  } catch (error) {
    responderError(res, error);
  } finally {
    session.endSession();
  }
};

const deletePresupuesto = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      // Mismo criterio que la edición: solo bloquea una nota de pedido ACTIVA.
      if (await tieneNotaActiva(id, session)) {
        throw httpError(409, '❌ No se puede eliminar el presupuesto porque tiene una nota de pedido asociada.');
      }

      const eliminado = await Presupuesto.findOneAndUpdate(
        { _id: id, estado: true },
        { estado: false },
        { new: true, session }
      );
      if (!eliminado) throw httpError(404, '❌ El presupuesto no existe o ya fue eliminado.');

      await PresupuestoDetalle.updateMany({ presupuesto: id }, { estado: false }, { session });
    });
    res.status(200).json({ ok: true, message: '✔️ Presupuesto eliminado correctamente.' });
  } catch (error) {
    responderError(res, error);
  } finally {
    session.endSession();
  }
};

const buscarPresupuesto = async (req, res) => {
  try {
    const { presupuestoID, cliente, empleado, total, detalles } = req.body;

    // Si hay filtro por producto, primero se buscan los presupuestos que lo contienen.
    const productosBuscados = detalles?.length > 0 ? detalles.map(d => d.producto) : [];
    let presupuestosIDsDeDetalles = null;

    if (productosBuscados.length > 0) {
      presupuestosIDsDeDetalles = await PresupuestoDetalle.distinct(
        'presupuesto',
        { producto: { $in: productosBuscados }, estado: true }
      );
      if (presupuestosIDsDeDetalles.length === 0) {
        return res.status(200).json({ ok: true, data: [], message: "Sin resultados." });
      }
    }

    const condiciones = [{ estado: true }];
    if (presupuestoID) condiciones.push({ _id: Number(presupuestoID) });
    if (cliente) condiciones.push({ cliente });
    if (empleado) condiciones.push({ empleado });
    if (total) condiciones.push({ total: Number(total) });
    if (presupuestosIDsDeDetalles) condiciones.push({ _id: { $in: presupuestosIDsDeDetalles } });

    const presupuestos = await Presupuesto.find({ $and: condiciones }).lean();
    res.status(200).json({
      ok: true,
      message: "✔️ Presupuestos obtenidos",
      data: presupuestos.map(p => ({ ...p, vigente: estaVigente(p) })),
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });
  }
};

module.exports = {
  setPresupuesto, getPresupuesto, getPresupuestoID, getPresupuestoParaNota,
  updatePresupuesto, deletePresupuesto, buscarPresupuesto, guardarDetallesPresupuesto,
};
