const Remito = require("../models/proveedorRemito_Model");
const RemitoDetalle = require("../models/proveedorRemitoDetalle_Model");
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const getNextSequence = require("./counter_Controller");
const Producto = require("../models/producto_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');
const { httpError } = require('../utils/http');
const { validarCantidad, sumarStock, descontarStock } = require('../utils/stock');
const { leerPaginacion, paginar } = require('../utils/paginacion');

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

// Cantidad ya recibida por producto en remitos activos de un comprobante.
const cantidadesRecibidas = async (comprobanteCompraID, session, excluirRemitoID = null) => {
  const filtroRemitos = { comprobanteCompra: comprobanteCompraID, estado: true };
  if (excluirRemitoID) filtroRemitos._id = { $ne: excluirRemitoID };
  const remitos = await Remito.distinct('_id', filtroRemitos).session(session);
  const lineas = await RemitoDetalle.find({ remito: { $in: remitos }, estado: true }).session(session).lean();
  const recibido = new Map();
  for (const l of lineas) recibido.set(Number(l.producto), (recibido.get(Number(l.producto)) || 0) + l.cantidad);
  return recibido;
};

// Recepción de mercadería: admite entregas parciales (varios remitos por comprobante), pero
// nunca recibir un producto que no está en el comprobante ni más cantidad que la facturada.
const setRemito = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let newRemito;
    await session.withTransaction(async () => {
      const { totalPrecio, totalBultos, comprobanteCompra, transporte, detalles } = req.body;

      if (!totalPrecio || !totalBultos || !comprobanteCompra || !transporte) {
        throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
      }
      if (!Array.isArray(detalles) || detalles.length === 0) {
        throw httpError(400, "❌ El remito debe tener al menos un detalle.");
      }

      const comprobante = await ComprobanteCompra.findOne({ _id: comprobanteCompra, estado: true }).session(session).lean();
      if (!comprobante) throw httpError(400, "❌ El comprobante de compra no existe o fue anulado.");

      const lineasComprobante = await ComprobanteCompraDetalle
        .find({ comprobanteCompra: comprobante._id, estado: true }).session(session).lean();
      const facturado = new Map();
      const precioPorProducto = new Map();
      for (const l of lineasComprobante) {
        facturado.set(Number(l.producto), (facturado.get(Number(l.producto)) || 0) + l.cantidad);
        precioPorProducto.set(Number(l.producto), Number(l.precio));
      }
      const recibido = await cantidadesRecibidas(comprobante._id, session);

      const lineas = detalles.map((d) => ({ producto: Number(d.producto), cantidad: validarCantidad(d.cantidad) }));
      for (const l of lineas) {
        if (!facturado.has(l.producto)) {
          throw httpError(400, `❌ El producto ${l.producto} no figura en el comprobante de compra.`);
        }
        const nuevoRecibido = (recibido.get(l.producto) || 0) + l.cantidad;
        if (nuevoRecibido > facturado.get(l.producto)) {
          throw httpError(400, `❌ Se intenta recibir ${nuevoRecibido} unidades del producto ${l.producto}, pero el comprobante tiene ${facturado.get(l.producto)}.`);
        }
        recibido.set(l.producto, nuevoRecibido);
      }

      const newId = await getNextSequence("Proveedor_Remito", session);
      newRemito = new Remito({
        _id: newId,
        totalPrecio,
        totalBultos,
        fecha: obtenerFechaHoy(),
        comprobanteCompra: comprobante._id,
        transporte,
        estado: true
      });
      await newRemito.save({ session });

      const primerId = await getNextSequence("Proveedor_RemitoDetalle", session, lineas.length);
      await RemitoDetalle.insertMany(
        lineas.map((l, i) => ({ _id: primerId + i, remito: newId, ...l, estado: true })),
        { session }
      );

      for (const l of lineas) {
        await sumarStock(l.producto, l.cantidad, session);
        // Actualiza el precio de costo con el del comprobante (solo vinos e insumos lo tienen).
        // Se actualiza solo ese campo: guardar el documento completo fallaría si un producto
        // viejo no tiene algún campo obligatorio.
        if (precioPorProducto.has(l.producto)) {
          await Producto.updateOne(
            { _id: l.producto, tipoProducto: { $in: ['ProductoVino', 'ProductoInsumo'] } },
            { $set: { precioCosto: precioPorProducto.get(l.producto) } },
            { session, strict: false }
          );
        }
      }
    });

    return res.status(201).json({
      ok: true,
      message: "✔️ Remito agregado correctamente.",
      data: newRemito
    });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
};

const getRemito = async(req, res) => {
    const resultado = await paginar(Remito, { estado: true }, leerPaginacion(req.query));
    res.status(200).json({ ok: true, ...resultado });
}

const getRemitosByProveedor = async (req, res) => {
  try {
    const proveedorID = req.params.id;

    if (!proveedorID) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // Buscar órdenes de compra activas del proveedor
    const ordenes = await OrdenCompra.find({ estado: true, proveedor: proveedorID });

    if (ordenes.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ Este proveedor no tiene órdenes de compra activas.",
      });
    }

    const ordenesIDs = ordenes.map(o => o._id);

    // Buscar comprobantes asociados a esas órdenes
    const comprobantesCompra = await ComprobanteCompra.find({
      ordenCompra: { $in: ordenesIDs },
      estado: true,
    });

    if (comprobantesCompra.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontraron comprobantes para este proveedor.",
      });
    }

    const comprobantesIDs = comprobantesCompra.map(c => c._id);

    // Buscar remitos asociados
    const remitos = await Remito.find({
      comprobanteCompra: { $in: comprobantesIDs },
      estado: true,
    });

    if (remitos.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontraron remitos para este proveedor.",
      });
    }

    // ÉXITO
    res.status(200).json({
      ok: true,
      data: {
        remitos
      },
      message: "✔️ Remitos obtenidos correctamente.",
    });

  } catch (error) {
    console.error("❌ Error al obtener datos:", error);
    res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor al obtener los datos.",
    });
  }
};


const getRemitoID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // 1️⃣ Buscamos el remito
    const remito = await Remito.findById(id);
    if (!remito) {
      return res.status(404).json({
        ok: false,
        message: "❌ El ID no corresponde a un remito.",
      });
    }

    // 2️⃣ Buscamos el comprobante de compra
    const comprobante = await ComprobanteCompra.findById(remito.comprobanteCompra);
    if (!comprobante) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró el comprobante de compra asociado al remito.",
      });
    }

    // 3️⃣ Buscamos la orden de compra
    const orden = await OrdenCompra.findById(comprobante.ordenCompra);
    if (!orden) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró la orden de compra asociada al comprobante.",
      });
    }

    // 4️⃣ Obtenemos el proveedor desde la orden
    const proveedorID = orden.proveedor;

    // 5️⃣ Respondemos
    res.status(200).json({
      ok: true,
      data: {
        remito,
        comprobante: comprobante._id,
        proveedor: proveedorID,
      },
      message:"✔️ Remito obtenido correctamente."
    });

  } catch (error) {
    console.error("❌ Error al obtener datos de remito:", error);
    res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor al obtener los datos del remito.",
    });
  }
};


// Solo se corrigen datos de transporte/bultos/precio. El comprobante y la fecha de recepción
// no cambian (cambiar el comprobante dejaría el stock recibido asociado a otra compra).
const updateRemito = async (req, res) => {
  const { totalPrecio, totalBultos, transporte } = req.body;
  if (!totalPrecio || !totalBultos || !transporte) {
    return res.status(400).json({ ok: false, message: "❌ Faltan completar algunos campos obligatorios." });
  }

  const updatedRemito = await Remito.findOneAndUpdate(
    { _id: req.params.id, estado: true },
    { totalPrecio, totalBultos, transporte },
    { new: true, runValidators: true }
  );
  if (!updatedRemito) {
    return res.status(404).json({ ok: false, message: "❌ No se encontró el remito para actualizar." });
  }

  return res.status(200).json({
    ok: true,
    message: "✔️ Remito actualizado correctamente.",
    data: updatedRemito
  });
};

// Anular un remito de proveedor devuelve el stock que había ingresado.
const deleteRemito = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      const remito = await Remito.findOneAndUpdate(
        { _id: id, estado: true }, { estado: false }, { new: true, session }
      );
      if (!remito) throw httpError(404, '❌ Remito no encontrado.');

      const lineas = await RemitoDetalle.find({ remito: id, estado: true }).session(session).lean();
      for (const l of lineas) {
        await descontarStock(l.producto, l.cantidad, session);
      }
      await RemitoDetalle.updateMany({ remito: id }, { estado: false }, { session });
    });
    res.status(200).json({ ok: true, message: '✔️ Remito eliminado correctamente y stock descontado.' });
  } catch (error) {
    if (error.status === 400 && /Stock insuficiente/.test(error.message)) {
      error.message = `❌ No se puede anular el remito: parte de la mercadería ya fue vendida o usada. ${error.message}`;
    }
    return responderError(res, error);
  } finally {
    session.endSession();
  }
}

const buscarRemito = async (req, res) => {
  try {
    const { remitoID, proveedor, comprobanteCompra, transporte, fecha } = req.body;
    const detalles = Array.isArray(req.body.detalles) ? req.body.detalles : [];
    const totalPrecio = Number(req.body.totalPrecio) || 0;
    const totalBultos = Number(req.body.totalBultos) || 0;

    const query = { estado: true };
    const condiciones = [];

    if (remitoID) condiciones.push({ _id: Number(remitoID) });

    const productos = detalles.map(d => Number(d.producto)).filter(Boolean);
    if (productos.length > 0) {
      const ids = await RemitoDetalle.distinct('remito', { producto: { $in: productos }, estado: true });
      condiciones.push({ _id: { $in: ids } });
    }

    if (comprobanteCompra) condiciones.push({ comprobanteCompra: Number(comprobanteCompra) });
    if (proveedor) {
      const ordenes = await OrdenCompra.distinct('_id', { proveedor: Number(proveedor) });
      const comprobantes = await ComprobanteCompra.distinct('_id', { ordenCompra: { $in: ordenes } });
      condiciones.push({ comprobanteCompra: { $in: comprobantes } });
    }

    if (transporte) query.transporte = Number(transporte);
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
    res.status(200).json({ ok: true, message: '✔️ Remitos obtenidos.', data: remitos });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};

module.exports = { setRemito , getRemitosByProveedor , buscarRemito , getRemito , getRemitoID , updateRemito , deleteRemito };