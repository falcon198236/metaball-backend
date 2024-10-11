const express = require('express');

const rounding = require('../../controllers/rounding');
const { checkListParam } = require('../../middleware/params');
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkListParam, catchError(rounding.gets));
router.get('/:_id', catchError(rounding.get));
router.post('/', catchError(rounding.create));
router.put('/:_id', catchError(rounding.update));
router.delete('/', catchError(rounding.removes));
router.delete('/:_id', catchError(rounding.remove));

module.exports = router;
