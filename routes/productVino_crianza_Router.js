const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProductVino_crianza_Controller')

router.post('/' , controller.setCrianza )

router.get('/' , controller.getCrianza)

router.get('/:id' , controller.getCrianzaID)

router.put('/:id' , controller.updateCrianza)

router.delete('/:id' , controller.deleteCrianza)

module.exports = router