const express = require('express');
const router = express.Router();
const controller = require('../controllers/caja_Controller');

router.post('/', controller.setCaja);
router.get('/', controller.getCaja);
router.get('/:id',controller.getCajaID);
router.put('/:id', controller.updateCaja);
router.delete('/:id', controller.deleteCaja);

module.exports=router;