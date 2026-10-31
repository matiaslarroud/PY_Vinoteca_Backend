const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/clienteNotaPedidoDetalle_Controller');

router.get('/', controller.getNotaPedidoDetalle);
router.get('/mas-vendidos', controller.getVinosMasVendidos);
router.get('/:id',controller.getNotaPedidoDetalleID);
router.get('/NotaPedido/:id', controller.getNotaPedidoDetalleByNotaPedido);

module.exports=router;