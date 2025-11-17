const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorComprobantePago_Controller');
// const imprimir = require('../src/comprobantePago_Proveedor_imprimir');

router.post('/', controller.setComprobantePago);
router.post('/buscar', controller.buscarComprobantePago);
router.get('/', controller.getComprobantePago);
router.get('/:id',controller.getComprobantePagoID);
// router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateComprobantePago);
router.delete('/:id', controller.deleteComprobantePago);

module.exports=router;