const crypto = require('crypto');
const User = require('../models/user');

const create = async(data) => {
    const {email, password} = data;
    if (!email) {
        return { status: false, error: 'invalid email.'};
    }
    if (!password) {
        return { status: false, error: 'empty password.'};
    }
    const _user = await User.findOne({email}).catch(() => {});
    if(_user) {
        return {status: false, error: 'the user is already exists.'};
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');
    delete data['password'];
    data['hash'] = hash;
    data['salt'] = salt;
    const user = new User ({
        ...data,
    });
    const result = await user.save().catch(err=> {
        return { status: false, error: err.message };
    });
    return {status: true, data: result};
};



module.exports = {
    create,
}