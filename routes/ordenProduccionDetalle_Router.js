const express = require('express');
const router = express.Router();
// Solo lectura: las líneas se crean, modifican y anulan a través del documento (cabecera),
// dentro de una transacción que mantiene stock, totales y caja consistentes.
const controller = require('../controllers/ordenProduccionDetalle_Controller')


router.get('/' , controller.getOrdenDetalle)

router.get('/:id' , controller.getOrdenDetalleID)

router.get('/ordenProduccion/:id' , controller.getOrdenDetalle_ByOrden)



module.exports = router