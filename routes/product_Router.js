const express = require('express');
const router = express.Router();
const controller = require('../controllers/product_Controller')
const ajusteStock = require('../controllers/ajusteStock_Controller')
const { admin } = require('../middleware/requireRole')

router.post('/' , controller.setProduct )

router.get('/' , controller.getProduct)

router.get('/tipos' , controller.getProductTipos)

router.get('/lowStock' , controller.lowStockProducts)

router.get('/lowStock/proveedor/:id' , controller.lowStockProductsByProveedor)


router.patch('/oferta/:id', controller.updateOfertaProducto)

router.get('/tipos/:id' , controller.getProductTipoID)

router.get('/:id' , controller.getProductID)

// El stock no se edita con el producto: se ajusta (solo administrador) y queda registrado.
router.get('/:id/ajusteStock' , ajusteStock.getAjustesStock)
router.post('/:id/ajusteStock' , admin, ajusteStock.setAjusteStock)

router.put('/:id' , controller.updateProduct)

router.delete('/:id' , controller.deleteProduct)

module.exports = router