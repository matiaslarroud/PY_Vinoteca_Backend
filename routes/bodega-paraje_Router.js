const express = require('express');
const router = express.Router();
const controller = require('../controllers/bodega-paraje_Controller');

router.post('/', controller.setParaje);
router.get('/', controller.getParaje);
router.get('/:id',controller.getParajeID);
router.put('/:id', controller.updateParaje);
router.delete('/:id', controller.deleteParaje);

module.exports=router;