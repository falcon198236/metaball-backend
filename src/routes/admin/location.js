const express = require('express');

const location = require('../../controllers/location');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, catchError(location.gets));
router.get('/:_id', checkAdminAuth, catchError(location.get));

router.post('/', checkAdminAuth, catchError(location.create));
router.put('/:_id', checkAdminAuth, catchError(location.update));

router.delete('/', checkAdminAuth, catchError(location.removes));
router.delete('/:_id', checkAdminAuth, catchError(location.remove));

module.exports = router;
