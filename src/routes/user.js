const express = require('express');

const user = require('../controllers/user');
const { checkAuth } = require('../middleware/auth')
const {catchError} = require('./error');
const { upload } = require('../middleware/file');

const router = express.Router();

router.get('/', checkAuth, catchError(user.gets));
router.post('/signup', catchError(user.signup));
router.put('/:_id', checkAuth, upload.array('files', 1), catchError(user.update));
router.post('/login', catchError(user.login));
router.post('/logout', checkAuth, catchError(user.logout));
router.delete('/:_id', checkAuth, catchError(user.remove));
router.post('/removes', checkAuth, catchError(user.removes));
router.get('/:_id', checkAuth, catchError(user.get));
module.exports = router;
