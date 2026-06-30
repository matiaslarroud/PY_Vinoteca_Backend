const express = require('express');
const router = express.Router();
const controller = require('../controllers/tiendaPresupuesto_Controller');

router.post('/', controller.setPresupuestoTienda);

module.exports = router;
