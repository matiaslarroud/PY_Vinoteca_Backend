const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario_Model.js');
const getNextSequence = require('./counter_Controller.js');

const SALT_ROUNDS = 10;

const setUsuario = async (req, res) => {
  try {
    const { name, password, rol } = req.body;
    if (!name || !password || !rol) {
      return res.status(400).json({ ok: false, message: '❌ Faltan completar algunos campos obligatorios.' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newId = await getNextSequence('Usuario');
    const newUsuario = new Usuario({ _id: newId, name, password: hashedPassword, rol, estado: true });
    await newUsuario.save();
    res.status(201).json({ ok: true, message: '✔️ Usuario agregado correctamente.' });
  } catch {
    res.status(400).json({ ok: false, message: '❌ Error al agregar Usuario.' });
  }
};

const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.find({ estado: true }, '-password').lean();
    res.status(200).json({ ok: true, data: usuarios });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al obtener usuarios.' });
  }
};

const getUsuarioID = async (req, res) => {
  try {
    const usuarioEncontrado = await Usuario.findById(req.params.id, '-password').lean();
    if (!usuarioEncontrado) {
      return res.status(404).json({ ok: false, message: '❌ Usuario no encontrado.' });
    }
    res.status(200).json({ ok: true, data: usuarioEncontrado, message: '✔️ Usuario obtenido correctamente.' });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al buscar usuario.' });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { name, password, rol } = req.body;
    if (!req.params.id || !name || !password || !rol) {
      return res.status(400).json({ ok: false, message: '❌ Faltan completar algunos campos obligatorios.' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const updatedUsuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { name, password: hashedPassword, rol },
      { new: true, runValidators: true }
    );
    if (!updatedUsuario) {
      return res.status(404).json({ ok: false, message: '❌ Usuario no encontrado.' });
    }
    res.status(200).json({ ok: true, message: '✔️ Usuario actualizado correctamente.' });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al actualizar usuario.' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const deletedUsuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estado: false },
      { new: true, runValidators: true }
    );
    if (!deletedUsuario) {
      return res.status(404).json({ ok: false, message: '❌ Usuario no encontrado.' });
    }
    res.status(200).json({ ok: true, message: '✔️ Usuario eliminado correctamente.' });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al eliminar usuario.' });
  }
};

const Login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ ok: false, msg: '❌ Credenciales requeridas.' });
    }
    const user = await Usuario.findOne({ name: usuario, estado: true });
    if (!user) {
      return res.status(401).json({ ok: false, msg: '❌ Credenciales inválidas.' });
    }
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, msg: '❌ Credenciales inválidas.' });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ ok: true, token, usuario: { usuario: user.name, rol: user.rol } });
  } catch {
    res.status(500).json({ ok: false, msg: '❌ Error interno del servidor.' });
  }
};

const getMe = (req, res) => {
  res.json({ ok: true, usuario: { usuario: req.user.name, rol: req.user.rol } });
};

module.exports = { setUsuario, getUsuario, getUsuarioID, updateUsuario, deleteUsuario, Login, getMe };
