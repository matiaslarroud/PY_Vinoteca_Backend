const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario_Controller');

router.post('/', controller.setUsuario);
router.post('/login', controller.Login);
router.get('/', controller.getUsuario);
router.get('/:id',controller.getUsuarioID);
router.put('/:id', controller.updateUsuario);
router.delete('/:id', controller.deleteUsuario);

module.exports=router;