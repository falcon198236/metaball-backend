const express = require('express');

const prime = require('../../controllers/prime');
const { checkAdminAuth } = require('../../middleware/auth');
const {checkListParam} = require('../../middleware/params');
const { upload } = require('../../middleware/file');
const {catchError} = require('../error');

const router = express.Router();

router.post('/', checkAdminAuth, upload.array('files', 1), catchError(prime.create));
router.put('/:_id', checkAdminAuth, upload.array('files', 1), catchError(prime.update));
router.get('/', checkAdminAuth, checkListParam, catchError(prime.gets));
router.get('/:_id', checkAdminAuth, checkListParam, catchError(prime.get));
router.delete('/', checkAdminAuth, catchError(prime.removes));
router.delete('/:_id', checkAdminAuth, catchError(prime.remove));

module.exports = router;
