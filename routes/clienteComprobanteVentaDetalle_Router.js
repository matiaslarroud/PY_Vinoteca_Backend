const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/clienteComprobanteVentaDetalle_Controller');

router.get('/', controller.getComprobanteVentaDetalle);
router.get('/:id',controller.getComprobanteVentaDetalleID);
router.get('/ComprobanteVenta/:id', controller.getComprobanteVentaDetalleByComprobanteVenta);

module.exports=router;