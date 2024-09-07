const express = require('express');

const userController = require('../controllers/user');
const { checkAppJwtAuth } = require('../middleware/auth')
const {catchError} = require('./error');

const router = express.Router();

router.get('/', checkAppJwtAuth, catchError(userController.getUsers));
router.post('/signup', catchError(userController.signup));
router.post('/login', catchError(userController.login));

module.exports = router;
