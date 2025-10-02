const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorPresupuestoDetalle_Controller');

router.post('/', controller.setPresupuestoDetalle);
router.get('/', controller.getPresupuestoDetalle);
router.get('/:id',controller.getPresupuestoDetalleID);
router.get('/presupuesto/:id', controller.getPresupuestoDetalleByPresupuesto);
router.put('/:id', controller.updatePresupuestoDetalle);
router.delete('/:id', controller.deletePresupuestoDetalle);

module.exports=router;