const express = require('express');
const router = express.Router();
const controller = require('../controllers/barrio_Controller.js');

router.post('/', controller.setBarrio);
router.get('/', controller.getBarrio);
router.get('/:id',controller.getBarrioID);
router.put('/:id', controller.updateBarrio);
router.delete('/:id', controller.deleteBarrio);

module.exports=router;