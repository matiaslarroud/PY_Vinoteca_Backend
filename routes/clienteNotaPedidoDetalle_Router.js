const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteNotaPedidoDetalle_Controller');

router.post('/', controller.setNotaPedidoDetalle);
router.get('/', controller.getNotaPedidoDetalle);
router.get('/:id',controller.getNotaPedidoDetalleID);
router.get('/NotaPedido/:id', controller.getNotaPedidoDetalleByNotaPedido);
router.put('/:id', controller.updateNotaPedidoDetalle);
router.delete('/:id', controller.deleteNotaPedidoDetalle);

module.exports=router;