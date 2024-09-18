const express = require('express');
const settings = require('../controllers/settings');
const {catchError} = require('./error');

const router = express.Router();

router.get('/life', catchError(settings.get_type_life));
router.get('/hit', catchError(settings.get_type_hit));
router.get('/experience', catchError(settings.get_type_experience));
router.get('/note', catchError(settings.get_type_note));
router.get('/invitor', catchError(settings.get_type_invitor));
router.get('/rounding', catchError(settings.get_type_roudning));
router.get('/theme', catchError(settings.get_type_theme));
router.get('/meeting', catchError(settings.get_type_meeting));

module.exports = router;
