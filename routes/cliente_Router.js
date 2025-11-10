const express = require("express");
const router = express.Router();
const controller = require("../controllers/cliente_Controller");


router.post('/', controller.setCliente);

router.post('/buscar', controller.buscarCliente);

router.get('/' , controller.getCliente)

router.get('/:id' , controller.getClienteID)

router.put('/:id' , controller.updateCliente)

router.delete('/:id' , controller.deleteCliente)

module.exports = router