const express = require('express');
const router = express.Router();
const controller = require('../controllers/localidad_Controller.js');

router.post('/', controller.setLocalidad);

router.get('/', controller.getLocalidad);

router.get('/:id', controller.getLocalidadID);

router.put('/:id', controller.updateLocalidad);

router.delete('/:id', controller.deleteLocalidad);

module.exports = router;