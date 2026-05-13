const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorComprobantePago_Controller');
const imprimir = require('../src/comprobantePagoProveedor_imprimir');

router.post('/', controller.setComprobantePago);
router.post('/buscar', controller.buscarComprobantePago);
router.get('/', controller.getComprobantePago);
router.get('/imprimir/:id', imprimir.imprimir);
router.get('/:id', controller.getComprobantePagoID);
router.put('/:id', controller.updateComprobantePago);
router.delete('/:id', controller.deleteComprobantePago);

module.exports=router;