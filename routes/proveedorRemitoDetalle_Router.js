const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/proveedorRemitoDetalle_Controller');

router.get('/', controller.getRemitoDetalle);
router.get('/:id',controller.getRemitoDetalleID);
router.get('/Remito/:id', controller.getRemitoDetalleByRemito);

module.exports=router;