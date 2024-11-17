const express = require('express');

const message = require('../../controllers/message');
const {checkListParam} = require('../../middleware/params');
const {catchError} = require('../error');

const router = express.Router();

router.get('/dm/:_id', checkListParam, catchError(message.get_dm_message_for_user));
router.get('/club/:_id', checkListParam, catchError(message.get_club_message));

router.delete('/:_id', checkListParam, catchError(message.remove));

module.exports = router;
