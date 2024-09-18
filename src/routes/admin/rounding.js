const express = require('express');

const settings = require('../../controllers/settings');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, catchError(settings.gets));
router.post('/create', checkAdminAuth, catchError(settings.create));
router.put('/', checkAdminAuth, catchError(settings.update));
router.delete('/:_id', checkAdminAuth, catchError(settings.remove));
router.post('/', checkAdminAuth, catchError(settings.removes));
router.get('/:_id', checkAdminAuth, catchError(settings.get));

module.exports = router;
