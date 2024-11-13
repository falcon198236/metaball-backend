const express = require('express');

const service = require('../../controllers/service');
const { checkAdminAuth } = require('../../middleware/auth');
const {checkListParam} = require('../../middleware/params');
const { upload } = require('../../middleware/file');
const {catchError} = require('../error');

const router = express.Router();

router.post('/', checkAdminAuth, upload.array('files', 1), catchError(service.create));
router.put('/:_id', checkAdminAuth, upload.array('files', 1), catchError(service.update));
router.get('/', checkAdminAuth, checkListParam, catchError(service.gets));
router.get('/:_id', checkAdminAuth, checkListParam, catchError(service.get));
router.delete('/', checkAdminAuth, catchError(service.removes));
router.delete('/:_id', checkAdminAuth, catchError(service.remove));

module.exports = router;
