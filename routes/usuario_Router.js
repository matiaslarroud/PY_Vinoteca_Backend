const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario_Controller');
const auth = require('../middleware/auth');
const { admin } = require('../middleware/requireRole');

router.post('/login', controller.Login);
router.get('/me', auth, controller.getMe);

// La administración de usuarios es exclusiva del rol administrador.
router.post('/', auth, admin, controller.setUsuario);
router.get('/', auth, admin, controller.getUsuario);
router.get('/:id', auth, admin, controller.getUsuarioID);
router.put('/:id', auth, admin, controller.updateUsuario);
router.delete('/:id', auth, admin, controller.deleteUsuario);

module.exports = router;
