const express = require('express');
const follow = require('../controllers/follow');
const {catchError} = require('./error');

const router = express.Router();


router.post('/user', catchError(follow.set_user));
router.delete('/user/:_id', catchError(follow.cancel_user));
router.get('/user/mine', catchError(follow.get_mine_users));
router.get('/user/yours', catchError(follow.get_yours_users));

router.post('/rounding/', catchError(follow.set_rounding));
router.get('/rounding/mine', catchError(follow.get_mine_roundings));
router.delete('/rounding/:_id', catchError(follow.cancel_rounding));

router.post('/blog/', catchError(follow.set_blog));
router.get('/blog/mine', catchError(follow.get_mine_blogs));
router.delete('/blog/:_id', catchError(follow.cancel_blog));


module.exports = router;

