const { httpError } = require('./http');
const { obtenerFechaHoy } = require('./fecha');

// Validez del presupuesto de cliente, en días corridos desde su fecha.
const DIAS_VALIDEZ = { DEFAULT: 5, MIN: 1, MAX: 30 };

const validarDiasValidez = (valor) => {
  if (valor == null || valor === '') return DIAS_VALIDEZ.DEFAULT;
  const dias = Number(valor);
  if (!Number.isInteger(dias) || dias < DIAS_VALIDEZ.MIN || dias > DIAS_VALIDEZ.MAX) {
    throw httpError(400, `❌ Los días de validez deben ser un entero entre ${DIAS_VALIDEZ.MIN} y ${DIAS_VALIDEZ.MAX}.`);
  }
  return dias;
};

// Las fechas se guardan como 'YYYY-MM-DD' (medianoche UTC), así que se suman días en UTC.
const calcularVencimiento = (fecha, dias) => {
  const vencimiento = new Date(fecha);
  vencimiento.setUTCDate(vencimiento.getUTCDate() + dias);
  return vencimiento;
};

// Vigente hasta el día de vencimiento inclusive. Los presupuestos anteriores a la vigencia
// (sin fechaVencimiento) se consideran vencidos: se usan los precios actuales.
const estaVigente = (presupuesto) =>
  !!presupuesto?.fechaVencimiento && new Date(obtenerFechaHoy()) <= new Date(presupuesto.fechaVencimiento);

module.exports = { DIAS_VALIDEZ, validarDiasValidez, calcularVencimiento, estaVigente };
