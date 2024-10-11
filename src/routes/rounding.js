const express = require('express');
const rounding = require('../controllers/rounding');
const {catchError} = require('./error');
const {checkListParam} = require('../middleware/params');

const router = express.Router();

router.post('/', catchError(rounding.create));
router.put('/:_id', catchError(rounding.update));
router.delete('/:_id', catchError(rounding.remove));

router.get('/', checkListParam, catchError(rounding.get_recent));
router.get('/mine/', checkListParam, catchError(rounding.get_mine));
router.get('/date/', checkListParam, catchError(rounding.get_date));
router.get('/gather-users/:_id', checkListParam, catchError(rounding.get_gather_users));
router.get('/:_id', checkListParam, catchError(rounding.get));

router.post('/request-user', catchError(rounding.request_rounding_user));
router.post('/request-owner', catchError(rounding.request_rounding_owner));
router.post('/allow-request', catchError(rounding.allow_request));
router.post('/remove-user', catchError(rounding.remove_user));

module.exports = router;

