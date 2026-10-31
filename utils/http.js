// Error con código HTTP: el error handler global de index.js lo convierte en { ok:false, message }.
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Escapa caracteres especiales para usar texto del usuario dentro de un $regex.
const escapeRegex = (s) => String(s).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Redondeo de importes a 2 decimales (evita 7899.999999).
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Error de índice único de MongoDB (E11000) → 409 con un mensaje legible.
const NOMBRES_CAMPO = { cuit: 'CUIT', name: 'nombre', email: 'email', notaPedido: 'nota de pedido' };
const errorClaveDuplicada = (err) => {
  if (err?.code !== 11000) return null;
  const campo = Object.keys(err.keyValue || err.keyPattern || {})[0];
  const nombre = NOMBRES_CAMPO[campo] || campo || 'ese valor';
  return httpError(409, `❌ Ya existe un registro con ese ${nombre}.`);
};

module.exports = { httpError, escapeRegex, round2, errorClaveDuplicada };
