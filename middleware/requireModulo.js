const { moduloActivo } = require('../utils/configuracion');

// Bloquea las rutas de un módulo opcional cuando el negocio lo tiene apagado.
// Responde 404 (y no 403): para ese negocio el módulo directamente no existe.
const requireModulo = (modulo) => async (req, res, next) => {
  try {
    if (await moduloActivo(modulo)) return next();
    res.status(404).json({ ok: false, message: '❌ Ruta no encontrada.' });
  } catch (err) {
    next(err);
  }
};

module.exports = requireModulo;
