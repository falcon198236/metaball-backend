const Systemlog = require('../models/systemlog');

const syslog = async(user, section, action, data = null) => {
    const systemlog = new Systemlog ({
        user,
        section,
        action,
        data,
    });
    await systemlog.save().catch(err=> {
        console.log(err.message)
    });
};

module.exports = {
    syslog,
}