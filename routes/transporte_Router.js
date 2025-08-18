const express = require('express');
const router = express.Router();
const controller = require('../controllers/transporte_Controller')

router.post('/' , controller.setTransporte )

router.get('/' , controller.getTransporte)

router.get('/:id' , controller.getTransporteID)

router.put('/:id' , controller.updateTransporte)

router.delete('/:id' , controller.deleteTransporte)

module.exports = router