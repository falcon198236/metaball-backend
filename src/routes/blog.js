const express = require('express');
const blog = require('../controllers/blog');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const { checkListParam } = require('../middleware/params');
const { correctBody } = require('../middleware/variable');
const { checkAuth, } = require('../middleware/auth')
const router = express.Router();

router.post('/', checkAuth, upload.array('files', 5), correctBody, catchError(blog.create));
router.put('/:_id', checkAuth, upload.array('files', 5), correctBody, catchError(blog.update));
router.delete('/:_id', checkAuth, catchError(blog.remove));

router.get('/user/:_id', checkAuth, checkListParam, catchError(blog.get_user));
router.get('/recent', checkListParam, catchError(blog.get_recent));
router.get('/mine/', checkAuth, checkListParam, catchError(blog.get_mine));
router.get('/others/', checkAuth, checkListParam, catchError(blog.get_others));
router.get('/reviewed/', checkAuth, checkListParam, catchError(blog.get_reviewed));
router.get('/:_id', checkAuth, catchError(blog.get));

router.post('/review', checkAuth, catchError(blog.review));

module.exports = router;
