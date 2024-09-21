const express = require('express');

const settings = require('../../controllers/settings');
const { checkListParam } = require('../../middleware/params')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkListParam, catchError(settings.gets));
router.get('/:_id', catchError(settings.get));

router.post('/', catchError(settings.create));
router.put('/:_id', catchError(settings.update));

router.delete('/', catchError(settings.removes));
router.delete('/:_id', catchError(settings.remove));

module.exports = router;
