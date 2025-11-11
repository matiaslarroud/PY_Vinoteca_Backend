const express = require("express");
const router = express.Router();
const controller = require("../controllers/pingServer");

router.get('/', controller.getConnection);

module.exports = router