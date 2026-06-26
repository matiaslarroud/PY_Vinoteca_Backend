const express = require('express');
const router = express.Router();
const controller = require('../controllers/tiendaNotaPedido_Controller');

router.post('/', controller.setNotaPedidoTienda);

module.exports = router;
