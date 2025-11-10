const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorRemitoDetalle_Controller');

router.post('/', controller.setRemitoDetalle);
router.get('/', controller.getRemitoDetalle);
router.get('/:id',controller.getRemitoDetalleID);
router.get('/Remito/:id', controller.getRemitoDetalleByRemito);
router.put('/:id', controller.updateRemitoDetalle);
router.delete('/:id', controller.deleteRemitoDetalle);

module.exports=router;