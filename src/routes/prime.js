const express = require('express');
const prime = require('../controllers/prime');
const {catchError} = require('./error');
const { checkListParam } = require('../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(prime.gets));
router.get('/:_id', checkListParam, catchError(prime.get));

module.exports = router;
