const express = require('express');
const router = express.Router();
const controller = require('../controllers/productPicada_Controller')

router.post('/' , controller.setProduct )

router.post('/buscar' , controller.buscarProducto )

router.get('/' , controller.getProduct)

router.get('/:id' , controller.getProductID)

router.put('/:id' , controller.updateProduct)

router.delete('/:id' , controller.deleteProduct)

module.exports = router