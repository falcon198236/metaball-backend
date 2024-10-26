const express = require('express');
const service = require('../controllers/service');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { checkListParam } = require('../middleware/params');

const router = express.Router();

router.post('/', upload.array('files', 1), catchError(service.create));
router.put('/:_id', catchError(service.update));
router.post('/order/:_id', catchError(service.change_order));
router.delete('/:_id', catchError(service.remove));

router.get('/', checkListParam, catchError(service.get));
router.get('/:_id', catchError(service.gets));

module.exports = router;
