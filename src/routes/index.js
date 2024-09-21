const express = require('express');
const user = require('./user');
const location = require('./location');
const content = require('./content');
const settings = require('./settings');
const club = require('./club');
const { checkAuth } = require('../middleware/auth')
const { login, signup} = require('../controllers/user');
const {catchError} = require('./error');
const router = express.Router();
// App api
router.use('/user', checkAuth, user);
router.use('/location', checkAuth, location);
router.use('/content', checkAuth, content);
router.use('/settings', checkAuth, settings);
router.use('/club', checkAuth, club);

router.post('/login', catchError(login));
router.post('/signup', catchError(signup));
module.exports = router;
