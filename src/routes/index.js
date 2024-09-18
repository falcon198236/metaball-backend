const express = require('express');
const user = require('./user');
const content = require('./content');
const settings = require('./settings');
const club = require('./club');
const { checkAuth } = require('../middleware/auth')

const router = express.Router();
// App api
router.use('/user', user);
router.use('/content', checkAuth, content);
router.use('/settings', checkAuth, settings);
router.use('/club', checkAuth, club);
module.exports = router;
