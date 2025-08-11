const express = require('express');
const router = express.Router();
const controller = require('../controllers/calle_Controller.js');

router.post('/', controller.setCalle);
router.get('/', controller.getCalle);
router.get('/:id',controller.getCalleID);
router.put('/:id', controller.updateCalle);
router.delete('/:id', controller.deleteCalle);

module.exports=router;