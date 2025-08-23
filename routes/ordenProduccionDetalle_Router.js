const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordenProduccionDetalle_Controller')

router.post('/' , controller.setOrdenProduccionDetalle)

router.get('/' , controller.getOrdenDetalle)

router.get('/:id' , controller.getOrdenDetalleID)

router.get('/ordenProduccion/:id' , controller.getOrdenDetalle_ByOrden)

router.put('/:id' , controller.updateOrdenDetalle)

router.delete('/:id' , controller.deleteOrdenDetalle)

module.exports = router