const express = require("express");
const router = express.Router();
const controller = require("../controllers/clienteReciboPago_Controller");
const imprimir = require("../src/reciboPagoCliente_imprimir");


router.post('/', controller.setReciboPago);

router.post('/buscar', controller.buscarReciboPago);

router.get('/' , controller.getReciboPago)

router.get("/imprimir/:id" , imprimir.imprimir);

router.get('/:id' , controller.getReciboPagoID)

router.put('/:id' , controller.updateReciboPago)

router.delete('/:id' , controller.deleteReciboPago)

module.exports = router