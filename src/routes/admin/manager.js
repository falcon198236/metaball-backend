const express = require('express');

const manager = require('../../controllers/manager');
const {checkListParam} = require('../../middleware/params');
const {catchError} = require('../error');

const router = express.Router();

router.post('/', catchError(manager.create));
router.put('/:_id', catchError(manager.update));
router.post('/logout', catchError(manager.logout));
router.delete('/', catchError(manager.removes));
router.delete('/:_id', catchError(manager.remove));
router.get('/', checkListParam, catchError(manager.gets));
router.get('/:_id', catchError(manager.get));
router.post('/change-pwd', catchError(manager.changePassword));
router.post('/reset-pwd', catchError(manager.resetPassword));

module.exports = router;
