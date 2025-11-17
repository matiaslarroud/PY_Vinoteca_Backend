const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorOrdenCompraDetalle_Controller');
// const imprimir = require('../src/OrdenCompraDetalleCliente_imprimir');

router.post('/', controller.setOrdenCompraDetalle);
router.get('/', controller.getOrdenCompraDetalle);
router.get('/:id',controller.getOrdenCompraDetalleID);
router.get('/OrdenCompra/:id',controller.getOrdenCompraDetalleByOrdenCompra);
// router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateOrdenCompraDetalle);
router.delete('/:id', controller.deleteOrdenCompraDetalle);

module.exports=router;