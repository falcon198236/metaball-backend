const express = require('express');

const user = require('../controllers/user');
const { checkAuth } = require('../middleware/auth')
const {catchError} = require('./error');
const { upload } = require('../middleware/file');

const router = express.Router();

router.post('/signup', catchError(user.signup));
router.post('/login', catchError(user.login));

router.get('/', checkAuth, catchError(user.me));
router.put('/', checkAuth, upload.array('files', 1), catchError(user.update));

router.post('/logout', checkAuth, catchError(user.logout));
router.post('/pwd', checkAuth, catchError(user.changePassword));

router.post('/forgot', checkAuth, catchError(user.forgot));

module.exports = router;
