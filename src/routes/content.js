const express = require('express');
const content = require('../controllers/content');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { checkListParam } = require('../middleware/params');
const { checkAuth } = require('../middleware/auth')

const router = express.Router();

router.get('/', checkListParam, catchError(content.gets));
router.get('/event', checkListParam, catchError(content.get_events));
router.get('/event/:_id', checkListParam, catchError(content.get_events_club));
router.get('/advertising', checkListParam, catchError(content.get_advertising));
router.get('/news', checkListParam, catchError(content.get_news));
router.get('/:_id', catchError(content.get));

module.exports = router;
