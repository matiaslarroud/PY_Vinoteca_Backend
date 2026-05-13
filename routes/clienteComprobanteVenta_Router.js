const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteComprobanteVenta_Controller');
const imprimir = require('../src/comprobanteVentaCliente_imprimir');


router.post('/', controller.setComprobanteVenta);
router.post('/buscar', controller.buscarComprobanteVenta);
router.get('/', controller.getComprobanteVenta);
router.get('/imprimir/:id', imprimir.imprimir);
router.get('/:id', controller.getComprobanteVentaID);
router.put('/:id', controller.updateComprobanteVenta);
router.delete('/:id', controller.deleteComprobanteVenta);

module.exports=router;