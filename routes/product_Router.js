const express = require('express');
const router = express.Router();
const controller = require('../controllers/product_Controller.js')

router.post('/' , controller.setProduct )

router.get('/' , controller.getProduct)

router.get('/:id' , controller.getProductID)

router.delete('/:id' , controller.deleteProduct)

module.exports = router