const Caja = require('../models/caja_Model');
const Cliente = require('../models/cliente_Model');
const getNextSequence = require('../controllers/counter_Controller');
const { obtenerFechaHoy } = require('./fecha');
const { httpError, round2 } = require('./http');

// Crea un movimiento de Caja vinculado a su documento de origen.
const crearMovimientoCaja = async ({ persona, tipoPersona, total, medioPago, tipo, referencia, origen, session }) => {
  const _id = await getNextSequence('Caja', session);
  const mov = new Caja({
    _id,
    fecha: obtenerFechaHoy(),
    persona,
    tipoPersona,
    total: round2(total),
    medioPago,
    referencia,
    tipo,
    origen,
    estado: true,
  });
  await mov.save({ session });
  return mov;
};

// Movimientos activos de un documento: por `origen` y, para los movimientos anteriores
// a ese campo, por coincidencia EXACTA de la referencia (el regex sin anclar mezclaba
// el N° 1 con el 10, 11, 100...).
const buscarMovimientosDeOrigen = (tipo, id, referenciasLegacy, session) =>
  Caja.find({
    estado: true,
    $or: [
      { 'origen.tipo': tipo, 'origen.id': Number(id) },
      { origen: { $exists: false }, referencia: { $in: referenciasLegacy } },
    ],
  }).session(session);

// Suma (o resta, con monto negativo) crédito disponible de Cuenta Corriente de un cliente
// de forma atómica. Al descontar, exige saldo suficiente.
const moverSaldoCuentaCorriente = async (clienteID, monto, session) => {
  const m = round2(monto);
  if (m === 0) return;
  const filtro = { _id: clienteID };
  if (m < 0) {
    filtro.cuentaCorriente = true;
    filtro.saldoActualCuentaCorriente = { $gte: -m };
  }
  const res = await Cliente.updateOne(filtro, { $inc: { saldoActualCuentaCorriente: m } }, { session });
  if (res.matchedCount === 0) {
    const cliente = await Cliente.findById(clienteID, 'cuentaCorriente saldoActualCuentaCorriente').session(session).lean();
    if (!cliente) throw httpError(400, '❌ Cliente inválido.');
    if (!cliente.cuentaCorriente) throw httpError(400, '❌ El cliente no tiene habilitada la Cuenta Corriente.');
    throw httpError(400, `❌ Saldo insuficiente. Saldo actual: $${cliente.saldoActualCuentaCorriente}`);
  }
};

module.exports = { crearMovimientoCaja, buscarMovimientosDeOrigen, moverSaldoCuentaCorriente };
