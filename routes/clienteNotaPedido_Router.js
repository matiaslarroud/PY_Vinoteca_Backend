const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteNotaPedido_Controller');
const imprimir = require('../src/notaPedidoCliente_imprimir');

router.post('/', controller.setNotaPedido);
router.post('/buscar', controller.buscarNotaPedido);
router.get('/', controller.getNotaPedido);
router.get('/:id',controller.getNotaPedidoID);
router.get("/imprimir/:id" , imprimir.imprimir);
router.get('/cliente/:id', controller.getNotaPedidoByCliente);
router.put('/:id', controller.updateNotaPedido);
router.delete('/:id', controller.deleteNotaPedido);

module.exports=router;