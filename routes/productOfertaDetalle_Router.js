const express = require('express');
const router = express.Router();
const controller = require('../controllers/ofertaProductoDetalle_Controller')

router.post('/' , controller.setOfertaProductoDetalle )

router.get('/' , controller.getOfertaDetalle)

router.get('/:id' , controller.getOfertaDetalleID)

router.get('/oferta/:id' , controller.getOfertaDetalle_ByOferta)

router.put('/:id' , controller.updateOfertaDetalle)

router.delete('/:id' , controller.deleteOfertaDetalle)

module.exports = router