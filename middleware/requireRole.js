// Restringe una ruta a los roles indicados. Debe usarse después de middleware/auth.js.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ ok: false, message: '❌ No tiene permisos para esta acción.' });
  }
  next();
};

const ROLES = {
  ADMIN: 'administrador',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente',
};

// Personal del negocio: puede operar todos los módulos de gestión.
const staff = requireRole(ROLES.ADMIN, ROLES.VENDEDOR);
const admin = requireRole(ROLES.ADMIN);

module.exports = { requireRole, staff, admin, ROLES };
