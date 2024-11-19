const express = require('express');

const follow = require('../../controllers/follow')
const {catchError} = require('../error');

const router = express.Router();

router.get('/user/to/:_id', catchError(follow.get_user_to_users));
router.get('/user/from/:_id', catchError(follow.get_user_from_users));

router.get('/rounding/:_id', catchError(follow.get_roundings));

router.get('/blog/:_id', catchError(follow.get_blogs));
module.exports = router;
