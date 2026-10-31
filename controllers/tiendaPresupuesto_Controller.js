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
const { round2 } = require("../utils/http");
const { validarCantidad } = require("../utils/stock");
const { calcularPrecioEfectivo } = require("../utils/precios");

const EMPLEADO_TIENDA = "Tienda Online";

// Empleado por defecto de la tienda (se busca en cada pedido: es una consulta liviana y
// así no queda un ID desactualizado en memoria).
const getEmpleadoDefault = async (session) => {
  const empleado = await Empleado.findOne({ name: EMPLEADO_TIENDA }, '_id').session(session).lean();
  if (!empleado) {
    throw new Error("❌ Falta el empleado por defecto de la tienda ('Tienda Online').");
  }
  return empleado;
};

const setPresupuestoTienda = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const clienteID = req.user?.cliente;
    if (!clienteID) {
      throw new Error("❌ El usuario no tiene un cliente asociado. Solo los usuarios con rol cliente pueden comprar.");
    }

    const detalles = req.body.detalles;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw new Error("❌ El pedido debe tener al menos un producto.");
    }

    const empleadoDefault = await getEmpleadoDefault(session);

    // Precios calculados en el servidor (precio de lista u oferta): el carrito del navegador
    // solo indica productos y cantidades.
    const lineas = [];
    let total = 0;
    for (const det of detalles) {
      const productoDB = await Producto.findOne({ _id: det.producto, estado: true }).session(session).lean();
      if (!productoDB) {
        throw new Error("❌ Producto inexistente.");
      }
      const cantidad = validarCantidad(det.cantidad);
      if (productoDB.stock < cantidad) {
        throw new Error(`❌ Stock insuficiente para ${productoDB.name}.`);
      }
      const precio = calcularPrecioEfectivo(productoDB);
      const importe = round2(precio * cantidad);
      total += importe;
      lineas.push({ producto: productoDB._id, cantidad, precio, importe });
    }

    const newId = await getNextSequence("Cliente_Presupuesto", session);
    const newPresupuesto = new Presupuesto({
      _id: newId,
      total: round2(total),
      fecha: obtenerFechaHoy(),
      cliente: clienteID,
      empleado: empleadoDefault._id,
      estado: true
    });

    await newPresupuesto.save({ session });

    // El presupuesto no descuenta stock: solo se validó que alcance.
    for (const l of lineas) {
      await setPresupuestoDetalle({ ...l, presupuesto: newId, session });
    }

    await session.commitTransaction();

    return res.status(201).json({
      ok: true,
      message: "✔️ Presupuesto creado correctamente.",
      data: { _id: newId, total: newPresupuesto.total }
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({ ok: false, message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { setPresupuestoTienda };
