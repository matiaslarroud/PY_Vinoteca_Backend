const express = require('express');
const router = express.Router();
const controller = require('../controllers/productPicadaDetalle_Controller')

router.post('/' , controller.setPicadaDetalle )

router.get('/' , controller.getPicadaDetalle)

router.get('/:id' , controller.getPicadaDetalleID)

router.get('/picada/:id' , controller.getPicadaDetalle_ByPicada)

router.put('/:id' , controller.updatePicadaDetalle)

router.delete('/:id' , controller.deletePicadaDetalle)

module.exports = router