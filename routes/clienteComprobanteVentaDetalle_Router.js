const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteComprobanteVentaDetalle_Controller');

router.post('/', controller.setComprobanteVentaDetalle);
router.get('/', controller.getComprobanteVentaDetalle);
router.get('/:id',controller.getComprobanteVentaDetalleID);
router.get('/ComprobanteVenta/:id', controller.getComprobanteVentaDetalleByComprobanteVenta);
router.put('/:id', controller.updateComprobanteVentaDetalle);
router.delete('/:id', controller.deleteComprobanteVentaDetalle);

module.exports=router;