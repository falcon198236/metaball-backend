const express = require('express');

const club = require('../controllers/club');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');
const {checkListParam} = require('../middleware/params');
const { correctBody, correctQuery } = require('../middleware/variable');

const router = express.Router();

// APIs for admin
router.get('/created', checkListParam, catchError(club.get_mine));
router.get('/joined/:_id', checkListParam, catchError(club.get_joined));
router.get('/available', checkListParam, catchError(club.get_available_clubs));

router.post('/add-member/:_id', checkListParam, catchError(club.add_member));
router.delete('/remove-member/:_id', checkListParam, catchError(club.remove_member));

router.get('/requested-users/:_id', checkListParam, catchError(club.get_requested_users));
router.get('/invited-users/:_id', checkListParam, catchError(club.get_invited_users));
router.get('/gather-users/:_id', correctQuery, catchError(club.get_available_users));

router.get('/list/request', checkListParam, catchError(club.request_list));
router.get('/list/invited', checkListParam, catchError(club.invited_list));

router.get('/:_id', catchError(club.get));
router.post('/', upload.array('files', 1), correctBody, catchError(club.create));
router.put('/:_id', upload.array('files', 1), correctBody, catchError(club.update));
router.delete('/', catchError(club.removes));
router.delete('/:_id', catchError(club.remove));

router.get('/users/:_id', checkListParam, catchError(club.get_users));
router.get('/managers/:_id', checkListParam, catchError(club.get_managers));
router.post('/request', catchError(club.request));
router.post('/invite', catchError(club.invite_user));
router.post('/invites', catchError(club.invite_users));
router.post('/allow-request', catchError(club.allow_request));
router.delete('/reject-request/:_id', catchError(club.reject_request));
router.post('/change-owner/:_id', catchError(club.change_owner));
router.post('/update-mangers/:_id', catchError(club.update_managers));
router.delete('/user/:_id', catchError(club.remove_user));

module.exports = router;
