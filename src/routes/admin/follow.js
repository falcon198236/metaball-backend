const express = require('express');

const access = require('../../controllers/access');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, catchError(access.gets));

router.post('/create', checkAdminAuth, catchError(access.create));
router.put('/', checkAdminAuth, catchError(access.update));
router.delete('/:_id', checkAdminAuth, catchError(access.remove));
router.post('/', checkAdminAuth, catchError(access.removes));
router.get('/:_id', checkAdminAuth, catchError(access.get));

module.exports = router;
