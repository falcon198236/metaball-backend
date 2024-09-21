const express = require('express');

const location = require('../controllers/location');
const {catchError} = require('./error');

const router = express.Router();

router.get('/', catchError(location.gets));

module.exports = router;
