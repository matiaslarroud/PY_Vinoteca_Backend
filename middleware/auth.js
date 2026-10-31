const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario_Model');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'No autorizado.' });
  }
  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado.' });
  }

  // Se vuelve a leer el usuario: un usuario desactivado o con rol cambiado
  // pierde el acceso de inmediato, sin esperar a que venza el token.
  const user = await Usuario.findOne({ _id: payload.id, estado: true }, 'name rol cliente').lean();
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Usuario inactivo o inexistente.' });
  }
  req.user = { id: user._id, name: user.name, rol: user.rol, cliente: user.cliente };
  next();
};

module.exports = authMiddleware;
