const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedorSolicitudPresupuesto_Controller');
// const imprimir = require('../src/presupuestoCliente_imprimir');

router.post('/', controller.setSolicitudPresupuesto);
router.get('/', controller.getSolicitudPresupuesto);
router.get('/:id',controller.getSolicitudPresupuestoID);
// router.get("/imprimir/:id" , imprimir.imprimir);
router.put('/:id', controller.updateSolicitudPresupuesto);
router.delete('/:id', controller.deleteSolicitudPresupuesto);

module.exports=router;