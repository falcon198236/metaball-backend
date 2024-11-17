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
const service = require('./service');
const message = require('./message');
const { checkAuth, verifyToken } = require('../middleware/auth')
const { 
    login, 
    signup, 
    logout, 
    email_send_code,
    forgot_pwd,
    reset_password,
} = require('../controllers/user');
const {catchError} = require('./error');
const router = express.Router();
// App api
router.use('/user', checkAuth, user);
router.use('/location', location);
router.use('/content', content);
router.use('/settings', settings);
router.use('/club', checkAuth, club);
router.use('/blog', blog);
router.use('/follow', checkAuth, follow);
router.use('/rounding', rounding);
router.use('/review', checkAuth, review);
router.use('/service', service);
router.use('/message', checkAuth, message);

router.post('/login', catchError(login));
router.post('/signup', catchError(signup));
router.post('/logout', checkAuth, catchError(logout));
router.post('/token', checkAuth, catchError(verifyToken));
router.post('/verify', catchError(email_send_code));
router.post('/forgot-pwd', catchError(forgot_pwd));
router.post('/reset-pwd', catchError(reset_password));



module.exports = router;
