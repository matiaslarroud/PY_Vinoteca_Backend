const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteComprobanteVenta_Controller');

router.post('/', controller.setComprobanteVenta);
router.get('/', controller.getComprobanteVenta);
router.get('/:id',controller.getComprobanteVentaID);
router.put('/:id', controller.updateComprobanteVenta);
router.delete('/:id', controller.deleteComprobanteVenta);

module.exports=router;