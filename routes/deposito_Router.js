const express = require('express');
const router = express.Router();
const controller = require('../controllers/deposito_Controller');

router.post('/', controller.setDeposito);

router.get('/', controller.getDeposito);

router.get('/:id', controller.getDepositoID);

router.put('/:id' , controller.updateDeposito);

router.delete('/:id', controller.deleteDeposito);

module.exports = router;