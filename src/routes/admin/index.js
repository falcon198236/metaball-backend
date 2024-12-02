const express = require('express');
const manager = require('./manager');
const user = require('./user');
const access = require('./access');
const location = require('./location');
const content = require('./content');
const blog = require('./blog');
const rounding = require('./rounding');
const settings = require('./settings');
const club = require('./club');
const dashboard = require('./dashboard');
const message = require('./message');
const follow = require('./follow');
const review = require('./review');
const service = require('./service');
const golfcourse = require('./golfcourse');
const syslog = require('./syslog');
const { login} = require('../../controllers/manager');
const { checkAdminAuth } = require('../../middleware/auth')

const {catchError} = require('../error');

const router = express.Router();

router.use('/dashboard', checkAdminAuth, dashboard);
router.use('/manager', checkAdminAuth, manager);
router.use('/user', checkAdminAuth, user);
router.use('/access', checkAdminAuth, access);
router.use('/settings', checkAdminAuth, settings);
router.use('/rounding', checkAdminAuth, rounding);
router.use('/club', checkAdminAuth, club);
router.use('/location', checkAdminAuth, location);
router.use('/content', checkAdminAuth, content);
router.use('/blog', checkAdminAuth, blog);
router.use('/message', checkAdminAuth, message);
router.use('/follow', checkAdminAuth, follow);
router.use('/review', checkAdminAuth, review);
router.use('/service', checkAdminAuth, service);
router.use('/golfcourse', checkAdminAuth, golfcourse);
router.use('/syslog', checkAdminAuth, syslog);

router.post('/login', catchError(login));


module.exports = router;
