const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProductVino_uva_Controller')

router.post('/' , controller.setUva )

router.get('/' , controller.getUva)

router.get('/:id' , controller.getUvaID)

router.put('/:id' , controller.updateUva)

router.delete('/:id' , controller.deleteUva)

module.exports = router