const Producto = require('../models/producto_Model');
const { httpError } = require('./http');

const validarCantidad = (cantidad) => {
  const n = Number(cantidad);
  if (!Number.isInteger(n) || n <= 0) {
    throw httpError(400, `❌ Cantidad inválida: ${cantidad}. Debe ser un entero mayor a 0.`);
  }
  return n;
};

// Descuenta stock de forma atómica: solo actualiza si hay stock suficiente.
// Evita ventas simultáneas que dejen el stock negativo.
const descontarStock = async (productoID, cantidad, session) => {
  const n = validarCantidad(cantidad);
  const res = await Producto.updateOne(
    { _id: productoID, stock: { $gte: n } },
    { $inc: { stock: -n } },
    { session }
  );
  if (res.matchedCount === 0) {
    const producto = await Producto.findById(productoID, 'name stock').session(session).lean();
    if (!producto) throw httpError(400, '❌ Producto no encontrado.');
    throw httpError(400, `❌ Stock insuficiente para ${producto.name} (disponible: ${producto.stock}).`);
  }
};

// Suma stock (devoluciones, anulaciones, recepción de mercadería).
const sumarStock = async (productoID, cantidad, session) => {
  const n = validarCantidad(cantidad);
  const res = await Producto.updateOne({ _id: productoID }, { $inc: { stock: n } }, { session });
  if (res.matchedCount === 0) throw httpError(400, '❌ Producto no encontrado.');
};

module.exports = { validarCantidad, descontarStock, sumarStock };
