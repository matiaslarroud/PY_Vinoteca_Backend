const express = require('express');
const router = express.Router();
const controller = require('../controllers/transporteDetalle_Controller')

router.post('/' , controller.setTransporteDetalle )

router.get('/' , controller.getTransporteDetalle)

router.get('/:id' , controller.getTransporteDetalleID)

router.get('/transporte/:id' , controller.getTransporteDetalle_ByTransporte)

router.put('/:id' , controller.updateTransporteDetalle)

router.delete('/:id' , controller.deleteTransporteDetalle)

module.exports = router