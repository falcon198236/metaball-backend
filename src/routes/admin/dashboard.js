const express = require('express');

const dashboard = require('../../controllers/dashboard');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, catchError(dashboard.get));
module.exports = router;
