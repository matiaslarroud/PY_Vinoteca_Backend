const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteNotaPedido_Controller');

router.post('/', controller.setNotaPedido);
router.get('/', controller.getNotaPedido);
router.get('/:id',controller.getNotaPedidoID);
router.get('/cliente/:id', controller.getNotaPedidoByCliente);
router.put('/:id', controller.updateNotaPedido);
router.delete('/:id', controller.deleteNotaPedido);

module.exports=router;