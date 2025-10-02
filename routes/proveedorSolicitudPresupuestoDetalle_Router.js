const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorSolicitudPresupuestoDetalle_Controller');

router.post('/', controller.setSolicitudPresupuestoDetalle);
router.get('/', controller.getSolicitudPresupuestoDetalle);
router.get('/:id',controller.getSolicitudPresupuestoDetalleID);
router.get('/solicitudPresupuesto/:id', controller.getSolicitudPresupuestoDetalleBySolicitudPresupuesto);
router.put('/:id', controller.updateSolicitudPresupuestoDetalle);
router.delete('/:id', controller.deleteSolicitudPresupuestoDetalle);

module.exports=router;