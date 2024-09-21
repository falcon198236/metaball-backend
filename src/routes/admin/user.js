const express = require('express');

const user = require('../../controllers/user');
const { catchError } = require('../error');
const { upload } = require('../../middleware/file');
const { checkListParam } = require('../../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(user.gets));
router.get('/:_id', catchError(user.get));
router.post('/', upload.array('files', 1),catchError(user.signup));
router.put('/:_id', upload.array('files', 1), catchError(user.update));
router.delete('/', catchError(user.removes));
router.delete('/:_id', catchError(user.remove));
module.exports = router;
