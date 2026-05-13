const express = require('express');
const router = express.Router();
const controller = require('../controllers/ofertaProducto_Controller')

router.post('/' , controller.setOferta )

router.post('/buscar' , controller.buscarOferta )

router.get('/' , controller.getOferta)

router.get('/:id' , controller.getOfertaID)

router.put('/:id' , controller.updateOferta)

router.delete('/:id' , controller.deleteOferta)

module.exports = router