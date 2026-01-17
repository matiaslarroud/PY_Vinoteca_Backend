const express = require('express');
const router = express.Router();
const controller = require('../controllers/caja_Controller');

// Crear y listar
router.post('/', controller.setCaja);
router.get('/', controller.getCaja);

// Reportes / filtros
router.get('/por-fecha', controller.getVentasByFecha);
router.get('/cliente/:id', controller.getVentasByCliente);
router.get('/cuentacorriente/cliente/:id', controller.getCuentaCorrienteByCliente);
router.get('/cuentacorriente/deudas', controller.getCuentasCorrienteConDeuda);

// Operaciones por ID (SIEMPRE AL FINAL)
router.get('/:id', controller.getCajaID);
router.put('/:id', controller.updateCaja);
router.delete('/:id', controller.deleteCaja);


module.exports=router;