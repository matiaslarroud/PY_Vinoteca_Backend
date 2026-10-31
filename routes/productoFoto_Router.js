const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/productoFoto_Controller');
const { staff } = require('../middleware/requireRole');

const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (FORMATOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('❌ Formato de imagen no permitido (solo JPG, PNG o WEBP).'), { status: 400 }));
  },
});

// Lectura: disponible también para clientes de la tienda online.
router.get('/catalogo', controller.getCatalogoProductos);
router.get('/ofertas', controller.getProductosEnOferta);
router.get('/producto/:productoID', controller.getProductoFoto);
router.get('/foto/:fotoID', controller.getProductoFotoID);

// Escritura: solo personal del negocio.
router.post('/:productoID', staff, upload.array("fotos", 10), controller.setProductoFoto);
router.put('/:fotoID', staff, controller.updateProductoFoto);
router.delete('/:fotoID', staff, controller.deleteProductoFoto);

module.exports = router;
