const express = require('express');

const golfcourse = require('../../controllers/golfcourse');
const { checkListParam } = require('../../middleware/params')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkListParam, catchError(golfcourse.gets));
router.get('/:_id', catchError(golfcourse.get));

router.post('/', catchError(golfcourse.create));
router.put('/:_id', catchError(golfcourse.update));

router.delete('/', catchError(golfcourse.removes));
router.delete('/:_id', catchError(golfcourse.remove));

module.exports = router;
