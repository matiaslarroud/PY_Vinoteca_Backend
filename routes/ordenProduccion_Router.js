const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordenProduccion_Controller')

router.post('/' , controller.setOrdenProduccion )

router.get('/' , controller.getOrdenProduccion)

router.get('/:id' , controller.getOrdenProduccionID)

router.put('/:id' , controller.updateOrdenProduccion)

router.put('/finalizar/:id' , controller.updateStock_Picada_Insumos)

router.delete('/:id' , controller.deleteOrdenProduccion)

module.exports = router