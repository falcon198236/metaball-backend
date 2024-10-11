const express = require('express');
const blog = require('../controllers/blog');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { checkListParam } = require('../middleware/params');

const router = express.Router();

router.post('/', upload.array('files', 5), catchError(blog.create));
router.put('/:_id', catchError(blog.update));
router.delete('/:_id', catchError(blog.remove));

router.get('/mine/', checkListParam, catchError(blog.get_mine));
router.get('/others/', checkListParam, catchError(blog.get_others));
router.get('/:_id', catchError(blog.get));

router.post('/review', catchError(blog.review));

module.exports = router;
