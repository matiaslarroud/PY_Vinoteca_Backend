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

module.exports = { httpError, escapeRegex, round2 };
