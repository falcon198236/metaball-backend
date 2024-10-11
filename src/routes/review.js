const express = require('express');
const review = require('../controllers/review');
const {catchError} = require('./error');
const {checkListParam} = require('../middleware/params');

const router = express.Router();

router.post('/', catchError(review.create));
router.put('/:_id', catchError(review.update));
router.delete('/:_id', catchError(review.remove));
router.get('/:_id', checkListParam, catchError(review.gets));
module.exports = router;
