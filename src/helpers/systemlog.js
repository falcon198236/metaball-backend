const moment = require('moment');

const Systemlog = require('../models/systemlog');

const sys_api_log = async(req, responsive) =>{
    const {currentUser} = req;
    console.log(moment().format('YYYY-MM-DD hh:mm:ss'), ' user:[', req.currentUser?._id.toString(), ':', req.currentUser?.email, '] - ', req.method, ':', req.originalUrl, '======>', responsive.code);
    const systemlog = new Systemlog({
        user: currentUser?._id,
        type: req.method,
        action: req.originalUrl,
        data: req.method === 'GET'? req.query: req.body,
        status: responsive.status,
        code: responsive.code,
        error: responsive.error,
    });
    await systemlog.save().catch(err=> {
        console.log(err.message)
    });
}

module.exports = {
    sys_api_log
}