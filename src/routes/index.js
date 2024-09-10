const express = require('express');
const user = require('./user');
const blog = require('./blog');

const { checkAuth } = require('../middleware/auth')

const router = express.Router();
// App api
router.use('/user', user);
router.use('/blog', checkAuth, blog);

module.exports = router;
