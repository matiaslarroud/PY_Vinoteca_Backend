const mongoose = require('mongoose');
const Producto = require('../models/producto_Model');
const AjusteStock = require('../models/ajusteStock_Model');
const getNextSequence = require('./counter_Controller');
const { httpError } = require('../utils/http');

// Ajuste manual de stock (solo administrador). cantidad > 0 suma, < 0 resta.
// El $inc es condicional: un ajuste negativo nunca deja el stock por debajo de 0,
// aunque en el medio se haya registrado una venta.
const setAjusteStock = async (req, res) => {
  const productoID = Number(req.params.id);
  const cantidad = Number(req.body.cantidad);
  const motivo = typeof req.body.motivo === 'string' ? req.body.motivo.trim() : '';

  if (!Number.isInteger(cantidad) || cantidad === 0) {
    throw httpError(400, '❌ La cantidad debe ser un número entero distinto de 0.');
  }
  if (!motivo) {
    throw httpError(400, '❌ Indicá el motivo del ajuste.');
  }

  const session = await mongoose.startSession();
  try {
    let ajuste;
    await session.withTransaction(async () => {
      const filtro = { _id: productoID, estado: true };
      if (cantidad < 0) filtro.stock = { $gte: -cantidad };

      const producto = await Producto.findOneAndUpdate(
        filtro,
        { $inc: { stock: cantidad } },
        { new: true, session, projection: 'name stock' }
      ).lean();

      if (!producto) {
        const actual = await Producto.findOne({ _id: productoID, estado: true }, 'name stock')
          .session(session).lean();
        if (!actual) throw httpError(404, '❌ Producto no encontrado.');
        throw httpError(400, `❌ El ajuste deja el stock de ${actual.name} en negativo (disponible: ${actual.stock}).`);
      }

      const [doc] = await AjusteStock.create([{
        _id: await getNextSequence('AjusteStock', session),
        producto: productoID,
        cantidad,
        stockAnterior: producto.stock - cantidad,
        stockNuevo: producto.stock,
        motivo,
        usuario: req.user.id,
        fecha: new Date(),
      }], { session });
      ajuste = doc;
    });

    res.status(201).json({ ok: true, message: '✔️ Stock ajustado correctamente.', data: ajuste });
  } finally {
    session.endSession();
  }
};

// Historial de ajustes de un producto, del más reciente al más antiguo.
const getAjustesStock = async (req, res) => {
  const ajustes = await AjusteStock.find({ producto: Number(req.params.id) })
    .sort({ fecha: -1 })
    .populate('usuario', 'name')
    .lean();
  res.status(200).json({ ok: true, data: ajustes });
};

module.exports = { setAjusteStock, getAjustesStock };
