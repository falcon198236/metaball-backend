const express = require('express');

const access = require('../../controllers/access');
const { checkListParam } = require('../../middleware/params')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkListParam, catchError(access.gets));
router.get('/:_id', catchError(access.get));

router.post('/', catchError(access.create));
router.put('/:_id', catchError(access.update));

router.delete('/', catchError(access.removes));
router.delete('/:_id', catchError(access.remove));

module.exports = router;
