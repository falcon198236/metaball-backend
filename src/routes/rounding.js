const express = require('express');
const rounding = require('../controllers/rounding');
const {catchError} = require('./error');

const router = express.Router();

router.delete('/:_id', catchError(rounding.remove));
router.post('/', catchError(rounding.create));


// router.get('/', catchError(rounding.getMine));
// router.get('/gather', catchError(content.getGathering));
// router.get('/run', catchError(content.getRuning));

module.exports = router;

