// controllers/tiendaNotaPedido_Controller.js
// Crea una Nota de Pedido Cliente desde la tienda online (autoservicio).
// - El cliente se toma del token (req.user.cliente), no del body.
// - empleado y medioPago usan registros por defecto ("Tienda Online" / "A coordinar").
// - NO genera movimiento de Caja ni descuenta Cuenta Corriente: eso ocurre al facturar
//   (Comprobante de Venta). La nota solo descuenta/reserva stock.
const mongoose = require('mongoose');
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Empleado = require("../models/empleado_Model");
const MedioPago = require("../models/medioPago_Model");
const getNextSequence = require("../controllers/counter_Controller");
const { setNotaPedidoDetalle } = require("./clienteNotaPedido_Controller");
const { obtenerFechaHoy } = require("../utils/fecha");

const EMPLEADO_TIENDA = "Tienda Online";
const MEDIOPAGO_COORDINAR = "A coordinar";

// Cache simple de los registros por defecto (resueltos por nombre)
let _empleadoDefault = null;
let _medioPagoDefault = null;

const getDefaults = async (session) => {
  if (!_empleadoDefault) {
    _empleadoDefault = await Empleado.findOne({ name: EMPLEADO_TIENDA }).session(session);
  }
  if (!_medioPagoDefault) {
    _medioPagoDefault = await MedioPago.findOne({ name: MEDIOPAGO_COORDINAR }).session(session);
  }
  if (!_empleadoDefault || !_medioPagoDefault) {
    throw new Error("❌ Faltan los registros por defecto de la tienda.");
  }
  return { empleadoDefault: _empleadoDefault, medioPagoDefault: _medioPagoDefault };
};

const setNotaPedidoTienda = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const clienteID = req.user?.cliente;
    if (!clienteID) {
      throw new Error("❌ El usuario no tiene un cliente asociado. Solo los usuarios con rol cliente pueden comprar.");
    }

    const totalP = req.body.total;
    const detalles = req.body.detalles;

    if (!totalP) {
      throw new Error("❌ El total del pedido es obligatorio.");
    }
    if (!detalles || detalles.length === 0) {
      throw new Error("❌ El pedido debe tener al menos un producto.");
    }

    const { empleadoDefault, medioPagoDefault } = await getDefaults(session);

    const newId = await getNextSequence("Cliente_NotaPedido");
    const newNotaPedido = new NotaPedido({
      _id: newId,
      fecha: obtenerFechaHoy(),
      fechaEntrega: new Date(obtenerFechaHoy()),
      cliente: clienteID,
      empleado: empleadoDefault._id,
      medioPago: medioPagoDefault._id,
      total: totalP,
      envio: false,
      estado: true
    });

    await newNotaPedido.save({ session });

    // Reutiliza la lógica de detalle (valida y descuenta stock; aborta si falta stock)
    for (const det of detalles) {
      await setNotaPedidoDetalle({
        importeP: det.importe,
        precioP: det.precio,
        cantidadP: det.cantidad,
        notaPedidoP: newId,
        productoID: det.producto,
        session
      });
    }

    await session.commitTransaction();

    return res.status(201).json({
      ok: true,
      message: "✔️ Pedido creado correctamente.",
      data: { _id: newId }
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({ ok: false, message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { setNotaPedidoTienda };
