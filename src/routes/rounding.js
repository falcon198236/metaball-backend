const express = require('express');
const rounding = require('../controllers/rounding');
const {catchError} = require('./error');
const { checkAuth } = require('../middleware/auth')
const {checkListParam} = require('../middleware/params');
const { correctBody, correctQuery } = require('../middleware/variable');
const router = express.Router();

router.post('/', checkAuth, correctBody, catchError(rounding.create));
router.put('/:_id', checkAuth, correctBody, catchError(rounding.update));
router.delete('/:_id', catchError(rounding.remove));

router.get('/', checkListParam, catchError(rounding.get_recent));
router.get('/mine/', checkAuth, checkListParam, catchError(rounding.get_mine));
router.get('/date/', checkAuth, checkListParam, correctQuery, catchError(rounding.get_date));
router.get('/range/', checkAuth, checkListParam, correctQuery, catchError(rounding.get_range));
router.get('/requested-users/:_id', checkAuth, checkListParam, correctQuery, catchError(rounding.get_requested_users));
router.get('/invited-users/:_id', checkAuth, checkListParam, catchError(rounding.get_invited_users));
router.get('/gather-users/:_id', checkAuth, checkListParam, correctQuery, catchError(rounding.get_available_users));
router.get('/club-roundings/', checkAuth, checkListParam, correctQuery, catchError(rounding.get_available_club_roundings));
router.get('/list/request', checkAuth, checkListParam, catchError(rounding.request_list));
router.get('/list/invited', checkAuth, checkListParam, catchError(rounding.invited_list));
router.get('/:_id', checkAuth, checkListParam, catchError(rounding.get));
router.get('/list/joined', checkAuth, checkListParam, catchError(rounding.joined_list));


router.get('/users/:_id', checkAuth, checkListParam, catchError(rounding.get_users));
router.post('/request', checkAuth, catchError(rounding.request));
router.post('/invite', checkAuth, catchError(rounding.invite_user));
router.post('/invites', checkAuth, catchError(rounding.invite_users));
router.post('/allow-request', checkAuth, catchError(rounding.allow_request));
router.delete('/reject-request/:_id', checkAuth, catchError(rounding.reject_request));
router.delete('/user/:_id', checkAuth, catchError(rounding.remove_user));

module.exports = router;

