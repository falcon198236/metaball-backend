const express = require('express');

const club = require('../../controllers/club');
const { checkAuth } = require('../../middleware/auth')
const {catchError} = require('./../error');
const { upload } = require('../../middleware/file');

const router = express.Router();

router.get('/', catchError(club.gets));
router.post('/create', upload.array('files', 1), catchError(club.create));
router.put('/:_id', upload.array('files', 1), catchError(club.update));
router.delete('/:_id', catchError(club.remove));
router.post('/removes', catchError(club.removes));
router.get('/:_id', catchError(club.get));

module.exports = router;
