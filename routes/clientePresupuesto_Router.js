const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientePresupuesto_Controller');
const imprimir = require('../src/presupuestoCliente_imprimir');

router.post('/', controller.setPresupuesto);
router.get('/', controller.getPresupuesto);
router.get('/:id',controller.getPresupuestoID);
router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updatePresupuesto);
router.delete('/:id', controller.deletePresupuesto);

module.exports=router;