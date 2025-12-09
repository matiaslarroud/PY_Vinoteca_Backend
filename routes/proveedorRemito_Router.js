const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorRemito_Controller');
// const imprimir = require('../src/remitoCliente_imprimir');

router.post('/', controller.setRemito);
router.post('/buscar', controller.buscarRemito);
router.get('/', controller.getRemito);
router.get('/proveedor/:id', controller.getRemitosByProveedor);
router.get('/:id',controller.getRemitoID);
// router.get('/imprimir/:id', imprimir.imprimir);
router.put('/:id', controller.updateRemito);
router.delete('/:id', controller.deleteRemito);

module.exports=router;