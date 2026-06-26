const express = require('express');
const router = express.Router();
const { getDbStatus, postSwitchDb } = require('../controllers/switchDb');

router.get('/', getDbStatus);
router.post('/', postSwitchDb);

module.exports = router;
