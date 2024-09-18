const express = require('express');

const location = require('../../controllers/location');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, catchError(location.gets));
router.post('/create', checkAdminAuth, catchError(location.create));
router.put('/', checkAdminAuth, catchError(location.update));
router.delete('/:_id', checkAdminAuth, catchError(location.remove));
router.post('/', checkAdminAuth, catchError(location.removes));
router.get('/:_id', checkAdminAuth, catchError(location.get));

module.exports = router;
