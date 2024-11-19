const express = require('express');
const blog = require('../../controllers/blog');
const {catchError} = require('../error');
const { upload } = require('../../middleware/file');
const { checkListParam } = require('../../middleware/params');

const router = express.Router();

router.get('/', checkListParam, catchError(blog.gets));
router.get('/:_id', catchError(blog.get));

router.post('/', upload.array('files', 1), catchError(blog.create));
router.post('/:_id', catchError(blog.activate));
router.put('/:_id', upload.array('files', 1), catchError(blog.update));

router.delete('/:_id', catchError(blog.remove));
router.delete('/', catchError(blog.removes));



module.exports = router;
