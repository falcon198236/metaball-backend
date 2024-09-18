const express = require('express');

const admin = require('../../controllers/admin');
const { checkAdminAuth } = require('../../middleware/auth')
const {catchError} = require('./../error');

const router = express.Router();

router.post('/create', checkAdminAuth, catchError(admin.create));
router.put('/', checkAdminAuth, catchError(admin.update));
router.post('/login', catchError(admin.login));
router.post('/logout', checkAdminAuth, catchError(admin.logout));
router.delete('/:_id', checkAdminAuth, catchError(admin.remove));
router.post('/removes', checkAdminAuth, catchError(admin.removes));
router.get('/', checkAdminAuth, catchError(admin.gets));
router.get('/:_id', checkAdminAuth, catchError(admin.get));

module.exports = router;
