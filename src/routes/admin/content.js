const express = require('express');
const content = require('../../controllers/content');
const {catchError} = require('../error');
const { upload } = require('../../middleware/file');
const { checkListParam } = require('../../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(content.gets));
router.get('/:_id', catchError(content.get));

router.post('/', upload.array('files', 1), catchError(content.create));
router.post('/:_id', catchError(content.activate));
router.put('/:_id', upload.array('files', 1), catchError(content.update));

router.delete('/:_id', catchError(content.remove));
router.delete('/', catchError(content.removes));



module.exports = router;
