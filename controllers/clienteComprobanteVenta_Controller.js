const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Cliente = require("../models/cliente_Model");
const MedioPago = require("../models/medioPago_Model");
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const Remito = require("../models/clienteRemito_Model");
const { httpError } = require("../utils/http");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

// Crea el Comprobante de Venta de una Nota de Pedido. El total y las líneas se copian de la
// nota (lo que se vendió y cobró), nunca del body. Una nota solo puede tener un comprobante activo.
const setComprobanteVenta = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let comprobante;
    await session.withTransaction(async () => {
      const { tipoComprobante, notaPedido: notaPedidoID } = req.body;
      if (!tipoComprobante || !notaPedidoID) {
        throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
      }

      const nota = await NotaPedido.findOne({ _id: notaPedidoID, estado: true }).session(session).lean();
      if (!nota) {
        throw httpError(400, "❌ La nota de pedido no existe o fue eliminada.");
      }
      if (await ComprobanteVenta.exists({ notaPedido: nota._id, estado: true }).session(session)) {
        throw httpError(409, `❌ La nota de pedido N° ${nota._id} ya está facturada.`);
      }

      const medioPago = await MedioPago.findById(nota.medioPago).session(session).lean();
      if (medioPago && medioPago.name === "A coordinar") {
        throw httpError(400, "❌ No se puede facturar con medio de pago 'A coordinar'. Edite la nota de pedido y seleccione el medio de pago real.");
      }

      const lineasNota = await NotaPedidoDetalle.find({ notaPedido: nota._id, estado: true }).session(session).lean();
      if (lineasNota.length === 0) {
        throw httpError(400, "❌ La nota de pedido no tiene detalles.");
      }

      const newId = await getNextSequence("Cliente_ComprobanteVenta", session);
      comprobante = new ComprobanteVenta({
        _id: newId,
        total: nota.total,
        fecha: obtenerFechaHoy(),
        tipoComprobante,
        facturado: true,
        remitoCreado: false,
        notaPedido: nota._id,
        estado: true
      });
      await comprobante.save({ session });

      // El Comprobante de Venta es solo facturación: NO genera movimientos de Caja
      // ni descuenta Cuenta Corriente (eso ocurre al crear la Nota de Pedido).
      const primerId = await getNextSequence("Cliente_ComprobanteVentaDetalle", session, lineasNota.length);
      await ComprobanteVentaDetalle.insertMany(lineasNota.map((l, i) => ({
        _id: primerId + i,
        comprobanteVenta: newId,
        producto: l.producto,
        precio: l.precio,
        cantidad: l.cantidad,
        importe: l.importe,
        estado: true
      })), { session });
    });

    return res.status(201).json({
      ok: true,
      message: '✔️ Comprobante de venta agregado correctamente.',
      data: comprobante
    });
  } catch (err) {
    return responderError(res, err);
  } finally {
    session.endSession();
  }
};


const getComprobanteVenta = async(req, res) => {
  try {
    const comprobanteVentas = await ComprobanteVenta.find({estado:true}).lean();
    res.status(200).json({ ok: true, data: comprobanteVentas });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al obtener comprobantes de venta.' });
  }
}

const getComprobanteVentaID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // Buscar comprobante principal
    const comprobanteVenta = await ComprobanteVenta.findById(id).lean();
    if (!comprobanteVenta) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró el comprobante de venta solicitado.",
      });
    }

    const notaPedido = await NotaPedido.findById(comprobanteVenta.notaPedido).lean();

    if (!notaPedido) {
      return res.status(404).json({
        ok: false,
        message: "❌ La nota de pedido asociada no fue encontrada.",
      });
    }

    const cliente = await Cliente.findById(notaPedido.cliente).lean();


    // Construir respuesta
    const body = {
      _id: comprobanteVenta._id,
      tipoComprobante: Number(comprobanteVenta.tipoComprobante),
      fecha: comprobanteVenta.fecha,
      notaPedido: Number(comprobanteVenta.notaPedido),
      total: comprobanteVenta.total,
      cliente: cliente
        ? {
            _id: Number(cliente._id),
            name: cliente.name,
          }
        : null,
    };
    res.status(200).json({
      ok: true,
      data: body,
      message:"✔️ Comprobante de venta obtenido correctamente."
    });
  } catch (err) {
    console.error("❌ Error al obtener comprobante de venta:", err);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor al obtener el comprobante de venta.",
    });
  }
};


// Un comprobante emitido es inmutable en lo fiscal (fecha, nota, total, líneas): solo se permite
// corregir el tipo de comprobante. Para cambiar el contenido, anularlo y emitir uno nuevo.
const updateComprobanteVenta = async (req, res) => {
  const { tipoComprobante } = req.body;
  if (!tipoComprobante) {
    return res.status(400).json({ ok: false, message: '❌ Debe indicar el tipo de comprobante.' });
  }

  const updated = await ComprobanteVenta.findOneAndUpdate(
    { _id: req.params.id, estado: true },
    { tipoComprobante },
    { new: true, runValidators: true }
  );
  if (!updated) {
    return res.status(404).json({ ok: false, message: '❌ Comprobante de venta no encontrado.' });
  }

  return res.status(200).json({
    ok: true,
    data: updated,
    message: '✔️ Comprobante de venta actualizado correctamente.'
  });
};


const deleteComprobanteVenta = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      const comprobante = await ComprobanteVenta.findOne({ _id: id, estado: true }).session(session).lean();
      if (!comprobante) throw httpError(404, '❌ Comprobante no encontrado.');

      if (await Remito.exists({ comprobanteVentaID: id, estado: true }).session(session)) {
        throw httpError(409, '❌ No se puede anular el comprobante porque tiene un remito activo. Elimine primero el remito.');
      }

      await ComprobanteVenta.updateOne({ _id: id }, { estado: false }, { session });
      await ComprobanteVentaDetalle.updateMany({ comprobanteVenta: id }, { estado: false }, { session });
      // El Comprobante de Venta no genera Caja ni CC (ocurre en la Nota de Pedido),
      // por lo tanto su anulación no revierte movimientos de Caja ni stock.
    });
    res.status(200).json({ ok: true, message: '✔️ Comprobante de venta eliminado correctamente.' });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
}

const buscarComprobanteVenta = async (req, res) => {
  try {
    const { comprobanteVentaID, cliente, detalles = [], notaPedido, total, fecha } = req.body;

    // Si hay filtro por producto, buscar en detalles primero
    const productosBuscados = detalles.map(d => d.producto).filter(Boolean);
    let comprobantesIDsDeDetalles = null;

    if (productosBuscados.length > 0) {
      const detallesFiltrados = await ComprobanteVentaDetalle.find(
        { producto: { $in: productosBuscados.map(Number) }, estado: true },
        'comprobanteVenta'
      ).lean();
      if (detallesFiltrados.length === 0) {
        return res.status(200).json({ ok: true, data: [], message: "Sin resultados." });
      }
      comprobantesIDsDeDetalles = [...new Set(detallesFiltrados.map(d => d.comprobanteVenta).filter(Boolean))];
    }

    // Si hay filtro por cliente, obtener sus notas de pedido
    let notasPedidoIDs = null;
    if (cliente) {
      const notas = await NotaPedido.find({ cliente: Number(cliente) }, '_id').lean();
      notasPedidoIDs = notas.map(n => n._id);
    }

    // Construir query directamente en MongoDB
    const query = { estado: true };
    // Los filtros sobre el mismo campo se combinan con $and (antes uno pisaba al otro).
    const condiciones = [];
    if (comprobanteVentaID) condiciones.push({ _id: Number(comprobanteVentaID) });
    if (comprobantesIDsDeDetalles) condiciones.push({ _id: { $in: comprobantesIDsDeDetalles } });
    if (notaPedido) condiciones.push({ notaPedido: Number(notaPedido) });
    if (notasPedidoIDs) condiciones.push({ notaPedido: { $in: notasPedidoIDs } });
    if (total) query.total = Number(total);
    if (fecha) query.fecha = fecha;
    if (condiciones.length) query.$and = condiciones;

    const comprobantes = await ComprobanteVenta.find(query).lean();
    res.status(200).json({ ok: true, data: comprobantes });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};



module.exports = { setComprobanteVenta , getComprobanteVenta , getComprobanteVentaID , updateComprobanteVenta , deleteComprobanteVenta , buscarComprobanteVenta };