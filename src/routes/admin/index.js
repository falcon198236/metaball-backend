const express = require('express');
const admin = require('./admin');
const access = require('./access');

const router = express.Router();
// App api
router.use('/', admin);
router.use('/access', access);

module.exports = router;
