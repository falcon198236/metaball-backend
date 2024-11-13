const express = require('express');

const user = require('../controllers/user');
const { checkAuth } = require('../middleware/auth')
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { correctBody } = require('../middleware/variable');
const router = express.Router();

router.post('/signup', correctBody, catchError(user.signup));
router.post('/login', catchError(user.login));

router.get('/', checkAuth, catchError(user.me));
router.get('/:_id', checkAuth, catchError(user.profile));

router.put('/', checkAuth, upload.array('files', 1), correctBody, catchError(user.update));

router.post('/pwd', checkAuth, catchError(user.changePassword));

router.post('/forgot', catchError(user.forgot));
router.post('/forget-code', catchError(user.check_forgot_code));
router.post('/reset-pwd', catchError(user.reset_password));

module.exports = router;
