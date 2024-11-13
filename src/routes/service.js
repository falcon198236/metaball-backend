const express = require('express');
const service = require('../controllers/service');
const {catchError} = require('./error');
const { checkListParam } = require('../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(service.gets));
router.get('/:_id', checkListParam, catchError(service.get));

module.exports = router;
