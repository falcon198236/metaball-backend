const express = require('express');

const golfcourse = require('../controllers/golfcourse');
const { checkListParam } = require('../middleware/params')
const {catchError} = require('./error');

const router = express.Router();

router.get('/', checkListParam, catchError(golfcourse.gets));
module.exports = router;
