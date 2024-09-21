const express = require('express');
const manager = require('./manager');
const user = require('./user');
const access = require('./access');
const location = require('./location');
const content = require('./content');
const settings = require('./settings');
const club = require('./club');
const { login} = require('../../controllers/manager');
const { checkAdminAuth } = require('../../middleware/auth')

const {catchError} = require('../error');

const router = express.Router();

router.use('/manager', checkAdminAuth, manager);
router.use('/user', checkAdminAuth, user);
router.use('/access', checkAdminAuth, access);
router.use('/settings', checkAdminAuth, settings);
router.use('/club', checkAdminAuth, club);
router.use('/location', checkAdminAuth, location);
router.use('/content', checkAdminAuth, content);

router.post('/login', catchError(login));


module.exports = router;
