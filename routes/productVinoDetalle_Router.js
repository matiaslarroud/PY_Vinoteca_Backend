const express = require('express');
const router = express.Router();
const controller = require('../controllers/productVinoDetalle_Controller')

router.post('/' , controller.setVinoDetalle )

router.get('/' , controller.getVinoDetalle)

router.get('/:id' , controller.getVinoDetalleID)

router.get('/vino/:id' , controller.getVinoDetalle_ByVino)

router.put('/:id' , controller.updateVinoDetalle)

router.delete('/:id' , controller.deleteVinoDetalle)

module.exports = router