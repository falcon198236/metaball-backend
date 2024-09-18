const express = require('express');
const admin = require('./admin');
const access = require('./access');
const settings = require('./settings');
const club = require('./club');

const router = express.Router();
// App api
router.use('/access', access);
router.use('/settings', settings);
router.use('/club', club);
router.use('/', admin);



module.exports = router;
