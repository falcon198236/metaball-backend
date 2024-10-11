const express = require('express');

const club = require('../../controllers/club');
const {catchError} = require('./../error');
const { upload } = require('../../middleware/file');
const { checkListParam } = require('../../middleware/params');
const router = express.Router();

router.get('/', checkListParam, catchError(club.gets));
router.get('/:_id', catchError(club.get));
router.post('/', upload.array('files', 1),catchError(club.create));
router.put('/:_id', upload.array('files', 1), catchError(club.update));
router.delete('/', catchError(club.removes));
router.delete('/:_id', catchError(club.remove));

module.exports = router;
