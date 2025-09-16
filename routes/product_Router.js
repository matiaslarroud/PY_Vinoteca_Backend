const express = require('express');
const router = express.Router();
const controller = require('../controllers/product_Controller')

router.post('/' , controller.setProduct )

router.get('/' , controller.getProduct)

router.get('/tipos' , controller.getProductTipos)

router.put('/stock/:id', controller.stockUpdate)

router.get('/tipos/:id' , controller.getProductTipoID)

router.get('/:id' , controller.getProductID)

router.put('/:id' , controller.updateProduct)

router.delete('/:id' , controller.deleteProduct)

module.exports = router