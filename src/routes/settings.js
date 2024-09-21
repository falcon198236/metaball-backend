const express = require('express');
const settings = require('../controllers/settings');
const {catchError} = require('./error');

const router = express.Router();

router.get('/theme', catchError(settings.get_type_theme));
router.get('/score', catchError(settings.get_type_score));
router.get('/experience', catchError(settings.get_type_experience));

module.exports = router;
