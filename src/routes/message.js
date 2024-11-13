const express = require('express');

const message = require('../controllers/message');
const {checkListParam} = require('../middleware/params');
const {catchError} = require('./error');
const { upload } = require('../middleware/file');

const router = express.Router();

router.get('/dm', checkListParam, catchError(message.get_users));
router.get('/clubs', checkListParam, catchError(message.get_clubs));
router.get('/dm/:_id', checkListParam, catchError(message.get_dm_message));
router.get('/dm-unread/:_id', checkListParam, catchError(message.get_dm_unread_message));
router.get('/club/:_id', checkListParam, catchError(message.get_club_message));
router.get('/club-unread/:_id', checkListParam, catchError(message.get_club_unread_message));
router.post('/dm/:_id', upload.array('files', 1), catchError(message.send_dm));
router.post('/club/:_id', upload.array('files', 1), catchError(message.send_club));

module.exports = router;
