const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientePresupuesto_Controller');

router.post('/', controller.setPresupuesto);
router.get('/', controller.getPresupuesto);
router.get('/:id',controller.getPresupuestoID);
router.put('/:id', controller.updatePresupuesto);
router.delete('/:id', controller.deletePresupuesto);

module.exports=router;