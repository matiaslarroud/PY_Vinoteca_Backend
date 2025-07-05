const express = require('express');
const router = express.Router();
const controller = require('../controllers/provincia_Controller.js');

router.post('/', controller.setProvincia);

router.get('/', controller.getProvincia);

router.get('/:id', controller.getProvinciaID);

router.put('/:id' , controller.updateProvincia);

router.delete('/:id', controller.deleteProvincia);

module.exports = router;