const express = require("express");
const router = express.Router();
const controller = require("../controllers/condicionIva_Controller");


router.post('/', controller.setCondicionIva);

router.get('/' , controller.getCondicionIva)

router.get('/:id' , controller.getCondicionIvaID)

router.put('/:id' , controller.updateCondicionIva)

router.delete('/:id' , controller.deleteCondicionIva)

module.exports = router