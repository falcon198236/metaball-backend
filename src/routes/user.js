const express = require('express');

const user = require('../controllers/user');
const { checkAuth } = require('../middleware/auth')
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { correctBody } = require('../middleware/variable');
const { checkListParam } = require('../middleware/params');
const router = express.Router();

router.get('/', catchError(user.me));
router.get('/:_id', catchError(user.profile));

router.put('/', upload.array('files', 1), correctBody, catchError(user.update));

router.post('/pwd', catchError(user.change_password));
router.post('/block', catchError(user.block_user));
router.post('/unblock', catchError(user.unblock_user));
router.get('/block-list/:_id', checkListParam, catchError(user.block_user_list));

router.post('/google-signup', catchError(user.google_signup));
router.post('/google-login', catchError(user.google_login));
router.post('/x-signup', catchError(user.x_signup));
router.post('/x-login', catchError(user.x_login));

module.exports = router;
