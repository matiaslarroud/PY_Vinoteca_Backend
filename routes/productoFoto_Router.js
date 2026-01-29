const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/productoFoto_Controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/:productoID', upload.array("fotos", 20), controller.setProductoFoto);
router.get('/producto/:productoID', controller.getProductoFoto);
router.get('/catalogo', controller.getCatalogoProductos);
router.get('/foto/:fotoID', controller.getProductoFotoID);
router.put('/:fotoID', controller.updateProductoFoto);
router.delete('/:fotoID', controller.deleteProductoFoto);

module.exports = router;