const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario_Controller');
const auth = require('../middleware/auth');

router.post('/login', controller.Login);
router.get('/me', auth, controller.getMe);

router.post('/', auth, controller.setUsuario);
router.get('/', auth, controller.getUsuario);
router.get('/:id', auth, controller.getUsuarioID);
router.put('/:id', auth, controller.updateUsuario);
router.delete('/:id', auth, controller.deleteUsuario);

module.exports = router;
