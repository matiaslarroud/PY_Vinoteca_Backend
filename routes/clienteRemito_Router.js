const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteRemito_Controller');

router.post('/', controller.setRemito);
router.get('/', controller.getRemito);
router.get('/:id',controller.getRemitoID);
router.put('/:id', controller.updateRemito);
router.delete('/:id', controller.deleteRemito);

module.exports=router;