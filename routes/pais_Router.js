const express = require("express");
const router = express.Router();
const controller = require("../controllers/pais_Controller.js");


router.post('/', controller.setPais);

router.get('/' , controller.getPais)

router.get('/:id' , controller.getPaisID)

router.put('/:id' , controller.updatePais)

router.delete('/:id' , controller.deletePais)

module.exports = router