const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Cliente = require("../models/cliente_Model");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');

const setComprobanteVentaDetalle = async ({
  importeP,
  comprobanteVentaP,
  productoID,
  precioP,
  cantidadP,
  session
}) => {

  if (!importeP || !comprobanteVentaP || !productoID || !precioP || !cantidadP) {
    throw new Error('❌ Error al cargar los datos del detalle.');
  }

  const newId = await getNextSequence("Cliente_ComprobanteVentaDetalle");

  const newComprobanteVentaDetalle = new ComprobanteVentaDetalle({
    _id: newId,
    importe: importeP,
    comprobanteVenta: comprobanteVentaP,
    producto: productoID,
    precio: precioP,
    cantidad: cantidadP,
    estado: true
  });

  await newComprobanteVentaDetalle.save({ session });

  return newComprobanteVentaDetalle;
};


const setComprobanteVenta = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const tipoComprobanteP = req.body.tipoComprobante;
        const notaPedidoP = req.body.notaPedido;
        const detalles = req.body.detalles;

        // Validar datos obligatorios
        if (!totalP || !fechaP || !tipoComprobanteP || !notaPedidoP) {
          throw new Error("❌ Faltan completar algunos campos obligatorios.") 
        }
        
        const newId = await getNextSequence("Cliente_ComprobanteVenta");
        // Crear el comprobante
        const newComprobanteVenta = new ComprobanteVenta({
            _id: newId,
            total: totalP,
            fecha: fechaP,
            tipoComprobante: tipoComprobanteP,
            facturado: true,
            remitoCreado: false,
            notaPedido: notaPedidoP,
            estado:true
        });

        // Guardar comprobante
        await newComprobanteVenta.save({session});
        
        if (!Array.isArray(detalles) || detalles.length === 0) {
          throw new Error("❌ El comprobante de venta debe tener al menos un detalle.");
        }

        // Guardar detalle  
        for (const det of detalles) {
                await setComprobanteVentaDetalle({
                    importeP: det.importe,
                    precioP: det.precio,
                    cantidadP: det.cantidad,
                    comprobanteVentaP: newId,
                    productoID: det.producto,
                    session
                });
            }

        await session.commitTransaction();

        // Respuesta final única
        return res.status(201).json({
            ok: true,
            message: '✔️ Comprobante de venta agregado y pedido actualizado correctamente.',
            data: newComprobanteVenta
        })

    } catch (err) {
        console.error(err);
        await session.abortTransaction();
        return res.status(500).json({
            ok: false,
            message: '❌ Error interno del servidor.'
        });
    }finally {
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
    const comprobanteVenta = await ComprobanteVenta.findById(id);
    if (!comprobanteVenta) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró el comprobante de venta solicitado.",
      });
    }

    const [notaPedido, detalles] = await Promise.all([
      NotaPedido.findById(comprobanteVenta.notaPedido).lean(),
      ComprobanteVentaDetalle.find({ comprobanteVenta: comprobanteVenta._id }).lean()
    ]);

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
      error: err.message,
    });
  }
};


const updateComprobanteVenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;

    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const tipoComprobanteP = req.body.tipoComprobante;
    const notaPedidoP = req.body.notaPedido;

    if (!id) {
      throw new Error('❌ El id no llegó al controlador correctamente.');
    }

    const updatedComprobanteVentaData = {
      total: totalP,
      fecha: fechaP,
      tipoComprobante: tipoComprobanteP,
      remitoCreado: false
    };

    if (notaPedidoP) {
      updatedComprobanteVentaData.notaPedido = notaPedidoP;
    }

    const updatedComprobanteVenta = await ComprobanteVenta.findByIdAndUpdate(
      id,
      updatedComprobanteVentaData,
      {
        new: true,
        runValidators: true,
        session
      }
    );

    if (!updatedComprobanteVenta) {
      throw new Error('❌ Error al actualizar el comprobante de venta.');
    }

    await session.commitTransaction();

    return res.status(200).json({
      ok: true,
      data: updatedComprobanteVenta,
      message: '✔️ Comprobante de venta actualizado correctamente.'
    });

  } catch (err) {
    console.error(err);
    await session.abortTransaction();

    return res.status(500).json({
      ok: false,
      message: err.message || '❌ Error interno del servidor.'
    });

  } finally {
    session.endSession();
  }
};


const deleteComprobanteVenta = async(req,res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    if(!id) throw new Error('❌ El id no llego al controlador correctamente.');

    const deleted = await ComprobanteVenta.findByIdAndUpdate(
        id, { estado: false }, { new: true, runValidators: true, session }
    );
    if(!deleted) throw new Error('❌ Comprobante no encontrado.');

    await ComprobanteVentaDetalle.updateMany(
        { comprobanteVenta: id }, { estado: false }, { session }
    );

    await session.commitTransaction();
    res.status(200).json({ ok: true, message: '✔️ Comprobante de venta eliminado correctamente.' });
  } catch(error) {
    await session.abortTransaction();
    res.status(400).json({ ok: false, message: error.message });
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
        { producto: { $in: productosBuscados } },
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
      const notas = await NotaPedido.find({ cliente }, '_id').lean();
      notasPedidoIDs = notas.map(n => n._id);
    }

    // Construir query directamente en MongoDB
    const query = { estado: true };
    if (comprobanteVentaID) query._id = Number(comprobanteVentaID);
    if (total) query.total = Number(total);
    if (fecha) query.fecha = fecha;
    if (notaPedido) query.notaPedido = notaPedido;
    if (notasPedidoIDs) query.notaPedido = { $in: notasPedidoIDs };
    if (comprobantesIDsDeDetalles) query._id = { $in: comprobantesIDsDeDetalles };

    const comprobantes = await ComprobanteVenta.find(query).lean();
    res.status(200).json({ ok: true, data: comprobantes });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};



module.exports = { setComprobanteVenta , getComprobanteVenta , getComprobanteVentaID , updateComprobanteVenta , deleteComprobanteVenta , buscarComprobanteVenta };