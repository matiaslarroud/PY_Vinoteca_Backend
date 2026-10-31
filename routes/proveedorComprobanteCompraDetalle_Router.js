const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/proveedorComprobanteCompraDetalle_Controller');
// const imprimir = require('../src/OrdenCompraDetalleCliente_imprimir');

router.get('/', controller.getComprobanteCompraDetalle);
router.get('/:id',controller.getComprobanteCompraDetalleID);
router.get('/ComprobanteCompra/:id',controller.getComprobanteCompraDetalleByComprobanteCompra);
// router.get("/imprimir/:id" , imprimir.imprimir);

module.exports=router;