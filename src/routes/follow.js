const express = require('express');
const follow = require('../controllers/follow');
const {catchError} = require('./error');

const router = express.Router();

router.delete('/:_id', catchError(follow.unset_mark));
router.post('/', catchError(follow.set_mark));
router.get('/followed', catchError(follow.get_followed));
router.get('/following', catchError(content.get_following));

module.exports = router;

