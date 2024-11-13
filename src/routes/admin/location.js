const express = require('express');

const location = require('../../controllers/location');
const { checkAdminAuth } = require('../../middleware/auth');
const {checkListParam} = require('../../middleware/params');
const {catchError} = require('../error');
const { upload } = require('../../middleware/file');

const router = express.Router();

router.get('/', checkAdminAuth, checkListParam, catchError(location.gets));
router.get('/:_id', checkAdminAuth, catchError(location.get));

router.post('/', upload.array('files', 1), catchError(location.create));
router.put('/:_id', upload.array('files', 1), catchError(location.update));

router.delete('/', checkAdminAuth, catchError(location.removes));
router.delete('/:_id', checkAdminAuth, catchError(location.remove));

module.exports = router;
