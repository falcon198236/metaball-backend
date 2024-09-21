const express = require('express');
const content = require('../controllers/content');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { checkListParam } = require('../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(content.gets));
router.get('/:_id', catchError(content.get));

module.exports = router;
