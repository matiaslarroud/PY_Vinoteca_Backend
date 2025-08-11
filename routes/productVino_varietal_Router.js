const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProductVino_varietal_Controller')

router.post('/' , controller.setVarietalVino )

router.get('/' , controller.getVarietalVino)

router.get('/:id' , controller.getVarietalVinoID)

router.put('/:id' , controller.updateVarietalVino)

router.delete('/:id' , controller.deleteVarietalVino)

module.exports = router