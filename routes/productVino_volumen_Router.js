const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProductVino_volumen_Controller')

router.post('/' , controller.setVolumen )

router.get('/' , controller.getVolumen)

router.get('/:id' , controller.getVolumenID)

router.put('/:id' , controller.updateVolumen)

router.delete('/:id' , controller.deleteVolumen)

module.exports = router