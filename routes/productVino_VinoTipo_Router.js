const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProductVino_vinoTipo_Controller')

router.post('/' , controller.setVinoTipo )

router.get('/' , controller.getVinoTipo)

router.get('/:id' , controller.getVinoTipoID)

router.put('/:id' , controller.updateVinoTipo)

router.delete('/:id' , controller.deleteVinoTipo)

module.exports = router