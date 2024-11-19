const express = require('express');

const review = require('../../controllers/review');
const {checkListParam} = require('../../middleware/params');
const {catchError} = require('../error');

const router = express.Router();

router.get('/:_id', checkListParam, catchError(review.gets));
router.delete('/:_id', catchError(review.remove));
router.delete('/', catchError(review.removes));

module.exports = router;
