const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteComprobanteVenta_Controller');
const imprimir = require('../src/comprobanteVentaCliente_imprimir');


router.post('/', controller.setComprobanteVenta);
router.get('/', controller.getComprobanteVenta);
router.get('/:id',controller.getComprobanteVentaID);
router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateComprobanteVenta);
router.delete('/:id', controller.deleteComprobanteVenta);

module.exports=router;