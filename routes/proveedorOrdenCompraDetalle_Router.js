const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/proveedorOrdenCompraDetalle_Controller');
// const imprimir = require('../src/OrdenCompraDetalleCliente_imprimir');

router.get('/', controller.getOrdenCompraDetalle);
router.get('/:id',controller.getOrdenCompraDetalleID);
router.get('/OrdenCompra/:id',controller.getOrdenCompraDetalleByOrdenCompra);
// router.get("/imprimir/:id" , imprimir.imprimir);

module.exports=router;