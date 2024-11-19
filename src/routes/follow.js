const express = require('express');
const follow = require('../controllers/follow');
const {catchError} = require('./error');

const router = express.Router();


router.post('/user', catchError(follow.set_user));
router.delete('/user/:_id', catchError(follow.cancel_user));
router.get('/user/to/:_id', catchError(follow.get_user_to_users));
router.get('/user/from/:_id', catchError(follow.get_user_from_users));

router.post('/rounding/', catchError(follow.set_rounding));
router.get('/rounding/:_id', catchError(follow.get_roundings));
router.delete('/rounding/:_id', catchError(follow.cancel_rounding));

router.post('/blog/', catchError(follow.set_blog));
router.get('/blog/:_id', catchError(follow.get_blogs));
router.delete('/blog/:_id', catchError(follow.cancel_blog));


module.exports = router;

