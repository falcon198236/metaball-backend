const express = require('express');
const content = require('../controllers/content');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');

const router = express.Router();

router.post('/create', upload.array('files', 5), catchError(content.create));
router.put('/:_id', upload.array('files', 5), catchError(content.update));
router.delete('/:_id', catchError(content.remove));
router.post('/removes', catchError(content.removes));
router.get('/:_id', catchError(content.get));
router.get('/', catchError(content.gets));

module.exports = router;
