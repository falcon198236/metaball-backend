const express = require('express');

const user = require('../controllers/user');
const { checkAuth } = require('../middleware/auth')
const {catchError} = require('./error');

const router = express.Router();

router.get('/', checkAuth, catchError(user.gets));
router.post('/signup', catchError(user.signup));
router.put('/', checkAuth, catchError(user.update));
router.post('/login', catchError(user.login));
router.post('/logout', checkAuth, catchError(user.logout));
router.delete('/:_id', checkAuth, catchError(user.remove));
router.get('/:_id', checkAuth, catchError(user.get));
module.exports = router;
