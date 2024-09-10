const express = require('express');
const blog = require('../controllers/blog');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const router = express.Router();

router.post('/create', upload.array('files', 5), catchError(blog.create));
router.put('/', catchError(blog.update));
router.delete('/:_id', catchError(blog.remove));
router.post('/removes', catchError(blog.removes));
router.get('/:_id', catchError(blog.get));
router.get('/', catchError(blog.gets));

module.exports = router;
