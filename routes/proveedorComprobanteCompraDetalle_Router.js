const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorComprobanteCompraDetalle_Controller');
// const imprimir = require('../src/OrdenCompraDetalleCliente_imprimir');

router.post('/', controller.setComprobanteCompraDetalle);
router.get('/', controller.getComprobanteCompraDetalle);
router.get('/:id',controller.getComprobanteCompraDetalleID);
router.get('/ComprobanteCompra/:id',controller.getComprobanteCompraDetalleByComprobanteCompra);
// router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateComprobanteCompraDetalle);
router.delete('/:id', controller.deleteComprobanteCompraDetalle);

module.exports=router;