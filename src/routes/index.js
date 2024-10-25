const express = require('express');
const user = require('./user');
const location = require('./location');
const content = require('./content');
const settings = require('./settings');
const club = require('./club');
const blog = require('./blog');
const follow = require('./follow');
const rounding = require('./rounding');
const review = require('./review');
const { checkAuth, verifyToken } = require('../middleware/auth')
const { login, signup, logout} = require('../controllers/user');
const {catchError} = require('./error');
const router = express.Router();
// App api
router.use('/user', checkAuth, user);
router.use('/location', checkAuth, location);
router.use('/content', checkAuth, content);
router.use('/settings', checkAuth, settings);
router.use('/club', checkAuth, club);
router.use('/blog', checkAuth, blog);
router.use('/follow', checkAuth, follow);
router.use('/rounding', checkAuth, rounding);
router.use('/review', checkAuth, review);

router.post('/login', catchError(login));
router.post('/signup', catchError(signup));
router.post('/logout', checkAuth, catchError(logout));
router.post('/token', checkAuth, catchError(verifyToken));

module.exports = router;
