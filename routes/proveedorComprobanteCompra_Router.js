const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorComprobanteCompra_Controller');
// const imprimir = require('../src/OrdenCompraCliente_imprimir');

router.post('/', controller.setComprobanteCompra);
router.post('/buscar', controller.buscarComprobanteCompra);
router.get('/', controller.getComprobanteCompra);
router.get('/proveedor/:id', controller.getComprobantesByProveedor);
router.get('/proveedorSinRemitos/:id', controller.getComprobantesSinRemitoByProveedor);
router.get('/:id', controller.getComprobanteCompraID);
router.put('/:id', controller.updateComprobanteCompra);
router.delete('/:id', controller.deleteComprobanteCompra);

module.exports=router;