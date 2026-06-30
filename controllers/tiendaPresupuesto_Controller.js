// controllers/tiendaPresupuesto_Controller.js
// Crea un Presupuesto de Cliente desde la tienda online (autoservicio).
// - El cliente se toma del token (req.user.cliente), no del body.
// - empleado usa el registro por defecto ("Tienda Online").
// - El presupuesto NO tiene medio de pago, NO genera movimiento de Caja y NO descuenta
//   stock (solo valida que exista stock suficiente). El dueño luego lo convierte en
//   Nota de Pedido eligiendo el medio de pago real, y ahí nace la Caja.
const mongoose = require('mongoose');
const Presupuesto = require("../models/clientePresupuesto_Model");
const Producto = require("../models/producto_Model");
const Empleado = require("../models/empleado_Model");
const getNextSequence = require("../controllers/counter_Controller");
const { setPresupuestoDetalle } = require("./clientePresupuesto_Controller");
const { obtenerFechaHoy } = require("../utils/fecha");

const EMPLEADO_TIENDA = "Tienda Online";

// Cache simple del empleado por defecto (resuelto por nombre)
let _empleadoDefault = null;

const getEmpleadoDefault = async (session) => {
  if (!_empleadoDefault) {
    _empleadoDefault = await Empleado.findOne({ name: EMPLEADO_TIENDA }).session(session);
  }
  if (!_empleadoDefault) {
    throw new Error("❌ Falta el empleado por defecto de la tienda ('Tienda Online').");
  }
  return _empleadoDefault;
};

const setPresupuestoTienda = async (req, res) => {
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

    const empleadoDefault = await getEmpleadoDefault(session);

    const newId = await getNextSequence("Cliente_Presupuesto");
    const newPresupuesto = new Presupuesto({
      _id: newId,
      total: totalP,
      fecha: obtenerFechaHoy(),
      cliente: clienteID,
      empleado: empleadoDefault._id,
      estado: true
    });

    await newPresupuesto.save({ session });

    // Valida existencia/stock (sin descontar) y crea los detalles del presupuesto.
    for (const det of detalles) {
      const productoDB = await Producto.findById(det.producto).session(session);
      if (!productoDB) {
        throw new Error("❌ Producto inexistente.");
      }
      if (productoDB.stock < det.cantidad) {
        throw new Error(`❌ Stock insuficiente para ${productoDB.name}.`);
      }

      await setPresupuestoDetalle({
        importe: det.importe,
        precio: det.precio,
        cantidad: det.cantidad,
        presupuesto: newId,
        producto: det.producto,
        session
      });
    }

    await session.commitTransaction();

    return res.status(201).json({
      ok: true,
      message: "✔️ Presupuesto creado correctamente.",
      data: { _id: newId }
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({ ok: false, message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { setPresupuestoTienda };
