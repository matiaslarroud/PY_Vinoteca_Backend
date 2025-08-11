const express = require("express");
const router = express.Router();
const controller = require("../controllers/proveedor_Controller");


router.post('/', controller.setProveedor);

router.get('/' , controller.getProveedor)

router.get('/:id' , controller.getProveedorID)

router.put('/:id' , controller.updateProveedor)

router.delete('/:id' , controller.deleteProveedor)

module.exports = router