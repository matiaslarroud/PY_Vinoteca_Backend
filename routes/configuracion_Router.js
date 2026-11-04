const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/configuracion_Controller');
const auth = require('../middleware/auth');
const { admin } = require('../middleware/requireRole');

const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (FORMATOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('❌ Formato de imagen no permitido (solo JPG, PNG o WEBP).'), { status: 400 }));
  },
});

// Público: marca y módulos para la pantalla de login y el menú.
router.get('/publica', controller.getConfiguracionPublica);

// Solo administrador.
router.get('/', auth, admin, controller.getConfiguracion);
router.put('/', auth, admin, controller.updateConfiguracion);
router.post('/logo', auth, admin, upload.single('logo'), controller.setLogo);

module.exports = router;
