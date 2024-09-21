const express = require('express');
const follow = require('../controllers/follow');
const {catchError} = require('./error');

const router = express.Router();

router.delete('/', catchError(follow.cancelFollow));
router.post('/', catchError(follow.setFollow));
router.get('/followed', catchError(follow.getFollowed));
router.get('/following', catchError(content.getFollowing));

module.exports = router;

