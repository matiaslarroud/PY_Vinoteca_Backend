const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoComprobante_Controller');

router.post('/', controller.setTipoComprobante);

router.get('/', controller.getTipoComprobante);

router.get('/:id', controller.getTipoComprobanteID);

router.put('/:id' , controller.updateTipoComprobante);

router.delete('/:id', controller.deleteTipoComprobante);

module.exports = router;