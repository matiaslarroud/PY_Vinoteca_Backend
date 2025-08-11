const express = require("express");
const router = express.Router();
const controller = require("../controllers/medioPago_Controller");


router.post('/', controller.setMedioPago);

router.get('/' , controller.getMedioPago)

router.get('/:id' , controller.getMedioPagoID)

router.put('/:id' , controller.updateMedioPago)

router.delete('/:id' , controller.deleteMedioPago)

module.exports = router