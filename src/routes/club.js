const express = require('express');

const club = require('../controllers/club');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const {checkListParam} = require('../middleware/params');

const router = express.Router();

// APIs for admin
router.get('/', checkListParam, catchError(club.getMyClubs));
router.get('/:_id', catchError(club.get));
router.post('/', upload.array('files', 1), catchError(club.create));
router.put('/:_id', upload.array('files', 1), catchError(club.update));
router.delete('/', catchError(club.removes));
router.delete('/:_id', catchError(club.remove));

router.get('/members/:_id', catchError(club.getMembers));
router.post('/add-members', catchError(club.addMembers));
router.post('/remove-members', catchError(club.removeMembers));


module.exports = router;
