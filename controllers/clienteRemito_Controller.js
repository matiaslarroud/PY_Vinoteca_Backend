const Remito = require("../models/clienteRemito_Model");
const RemitoDetalle = require("../models/clienteRemitoDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');
const { httpError } = require('../utils/http');
const { validarCantidad } = require('../utils/stock');

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

const setRemito = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let newRemito;
    await session.withTransaction(async () => {
      const { totalPrecio, totalBultos, comprobanteVenta, transporteID, detalles, entregado } = req.body;

      if (!totalPrecio || !totalBultos || !comprobanteVenta || !transporteID) {
        throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
      }
      if (!Array.isArray(detalles) || detalles.length === 0) {
        throw httpError(400, "❌ El remito debe tener al menos un detalle.");
      }

      // Marca el comprobante como "con remito" solo si estaba activo y sin remito:
      // funciona como bloqueo y evita dos remitos para la misma factura.
      const comprobante = await ComprobanteVenta.findOneAndUpdate(
        { _id: comprobanteVenta, estado: true, remitoCreado: { $ne: true } },
        { remitoCreado: true },
        { new: true, session }
      );
      if (!comprobante) {
        throw httpError(409, '❌ El comprobante de venta no existe, fue anulado o ya tiene un remito.');
      }

      const newId = await getNextSequence("Cliente_Remito", session);
      newRemito = new Remito({
        _id: newId,
        totalPrecio,
        totalBultos,
        fecha: obtenerFechaHoy(),
        // El schema define "comprobanteVentaID": antes se guardaba como "comprobanteVenta"
        // y Mongoose lo descartaba, por lo que el remito nunca quedaba vinculado a su factura.
        comprobanteVentaID: comprobante._id,
        transporteID,
        estado: true,
        entregado: entregado ?? false
      });
      await newRemito.save({ session });

      const primerId = await getNextSequence("Cliente_RemitoDetalle", session, detalles.length);
      await RemitoDetalle.insertMany(detalles.map((det, i) => {
        if (det.producto == null) throw httpError(400, "❌ Falta el producto en un detalle del remito.");
        return {
          _id: primerId + i,
          remitoID: newId,
          producto: det.producto,
          cantidad: validarCantidad(det.cantidad),
          estado: true
        };
      }), { session });
    });

    return res.status(201).json({
      ok: true,
      message: '✔️ Remito agregado correctamente.',
      data: newRemito
    });
  } catch (err) {
    return responderError(res, err);
  } finally {
    session.endSession();
  }
};



const getRemito = async(req, res) => {
    const remitos = await Remito.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: remitos
    })
}

const getRemitoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoEncontrado = await Remito.findById(id).lean();
    if(!remitoEncontrado){
        res.status(404).json({
            ok:false,
            message:'❌ El id no corresponde a un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:'✔️ Remito obtenido correctamente.',
        data:remitoEncontrado,
    })
}

// Se pueden corregir los datos de entrega (bultos, precio, transporte, entregado).
// La fecha de emisión y el comprobante asociado no cambian.
const updateRemito = async (req, res) => {
  const { totalPrecio, totalBultos, transporteID, entregado } = req.body;

  const updatedRemitoData = {};
  if (totalPrecio != null) updatedRemitoData.totalPrecio = totalPrecio;
  if (totalBultos != null) updatedRemitoData.totalBultos = totalBultos;
  if (transporteID) updatedRemitoData.transporteID = transporteID;
  if (entregado != null) updatedRemitoData.entregado = entregado;

  const updatedRemito = await Remito.findOneAndUpdate(
    { _id: req.params.id, estado: true },
    updatedRemitoData,
    { new: true, runValidators: true }
  );
  if (!updatedRemito) {
    return res.status(404).json({ ok: false, message: '❌ Remito no encontrado.' });
  }

  return res.status(200).json({
    ok: true,
    data: updatedRemito,
    message: '✔️ Remito actualizado correctamente.'
  });
};


const deleteRemito = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      const remito = await Remito.findOneAndUpdate(
        { _id: id, estado: true }, { estado: false }, { new: true, session }
      );
      if (!remito) throw httpError(404, '❌ Remito no encontrado.');

      await RemitoDetalle.updateMany({ remitoID: id }, { estado: false }, { session });

      // Libera el comprobante para poder emitir un nuevo remito.
      if (remito.comprobanteVentaID) {
        await ComprobanteVenta.updateOne({ _id: remito.comprobanteVentaID }, { remitoCreado: false }, { session });
      }
    });
    res.status(200).json({ ok: true, message: '✔️ Remito eliminado correctamente.' });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
}

const buscarRemito = async (req, res) => {
  try {
    const { remitoID, cliente, comprobanteVentaID, transporteID, entregado, fecha } = req.body;
    const detalles = Array.isArray(req.body.detalles) ? req.body.detalles : [];
    const totalPrecio = Number(req.body.totalPrecio) || 0;
    const totalBultos = Number(req.body.totalBultos) || 0;

    const query = { estado: true };
    const condiciones = [];

    if (remitoID) condiciones.push({ _id: Number(remitoID) });

    // Productos: remitos que contengan alguno de los productos buscados.
    const productos = detalles.map(d => Number(d.producto)).filter(Boolean);
    if (productos.length > 0) {
      const ids = await RemitoDetalle.distinct('remitoID', { producto: { $in: productos }, estado: true });
      condiciones.push({ _id: { $in: ids } });
    }

    if (comprobanteVentaID) condiciones.push({ comprobanteVentaID: Number(comprobanteVentaID) });

    // Cliente: remitos de los comprobantes de sus notas de pedido.
    if (cliente) {
      const notas = await NotaPedido.distinct('_id', { cliente: Number(cliente) });
      const comprobantes = await ComprobanteVenta.distinct('_id', { notaPedido: { $in: notas } });
      condiciones.push({ comprobanteVentaID: { $in: comprobantes } });
    }

    if (transporteID) query.transporteID = Number(transporteID);
    if (typeof entregado === 'boolean') query.entregado = entregado;
    if (totalPrecio) query.totalPrecio = totalPrecio;
    if (totalBultos) query.totalBultos = totalBultos;
    if (fecha) {
      const inicio = new Date(String(fecha).slice(0, 10));
      if (!Number.isNaN(inicio.getTime())) {
        query.fecha = { $gte: inicio, $lt: new Date(inicio.getTime() + 24 * 60 * 60 * 1000) };
      }
    }
    if (condiciones.length) query.$and = condiciones;

    const remitos = await Remito.find(query).lean();
    res.status(200).json({ ok: true, data: remitos });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};


module.exports = { setRemito , getRemito , getRemitoID , updateRemito , deleteRemito , buscarRemito };