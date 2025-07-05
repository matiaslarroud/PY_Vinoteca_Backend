const express = require('express');
const router = express.Router();
const controller = require('../controllers/bodega_Controller.js');

router.post('/' , controller.setBodega)

router.get('/' , controller.getBodega)

router.get('/:id' , controller.getBodegaID)

router.put('/:id' , controller.updateBodega)

router.delete('/:id' , controller.deleteBodega)

module.exports = router