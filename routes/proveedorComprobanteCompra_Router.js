const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorComprobanteCompra_Controller');
// const imprimir = require('../src/OrdenCompraCliente_imprimir');

router.post('/', controller.setComprobanteCompra);
router.get('/', controller.getComprobanteCompra);
router.get('/:id',controller.getComprobanteCompraID);
// router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateComprobanteCompra);
router.delete('/:id', controller.deleteComprobanteCompra);

module.exports=router;