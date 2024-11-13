const express = require('express');

const location = require('../controllers/location');
const {catchError} = require('./error');
const {checkListParam} = require('../middleware/params');
const router = express.Router();

router.get('/', checkListParam, catchError(location.gets));

module.exports = router;
