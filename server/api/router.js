const express = require('express');
const getTemp = require('./get-temp');

const router = express.Router();

const zipTempCache = new Map();

router.post('/temp', getTemp(zipTempCache));

module.exports = router;