const express = require("express");
const router = express.Router();
const controller = require("../controllers/empleado_Controller");


router.post('/', controller.setEmpleado);

router.get('/' , controller.getEmpleado)

router.get('/:id' , controller.getEmpleadoID)

router.put('/:id' , controller.updateEmpleado)

router.delete('/:id' , controller.deleteEmpleado)

module.exports = router