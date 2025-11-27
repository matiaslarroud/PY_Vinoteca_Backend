const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorOrdenCompra_Controller');
const imprimir = require('../src/ordenCompraProveedor_imprimir');

router.post('/', controller.setOrdenCompra);
router.post('/buscar', controller.buscarOrdenCompra);
router.get('/', controller.getOrdenCompra);
router.get('/:id',controller.getOrdenCompraID);
router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateOrdenCompra);
router.delete('/:id', controller.deleteOrdenCompra);

module.exports=router;