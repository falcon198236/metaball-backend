const express = require('express');

const syslog = require('../../controllers/syslog');
const { checkAdminAuth } = require('../../middleware/auth');
const {checkListParam} = require('../../middleware/params');
const {catchError} = require('../error');

const router = express.Router();

router.get('/', checkAdminAuth, checkListParam, catchError(syslog.gets));
router.delete('/', checkAdminAuth, catchError(syslog.removes));
router.delete('/:_id', checkAdminAuth, catchError(syslog.remove));
router.post('/enable', checkAdminAuth, catchError(syslog.set_enable));
router.get('/status', checkAdminAuth, catchError(syslog.get_status));

module.exports = router;
