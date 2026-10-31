const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/proveedorSolicitudPresupuestoDetalle_Controller');

router.get('/', controller.getSolicitudPresupuestoDetalle);
router.get('/:id',controller.getSolicitudPresupuestoDetalleID);
router.get('/solicitudPresupuesto/:id', controller.getSolicitudPresupuestoDetalleBySolicitudPresupuesto);

module.exports=router;