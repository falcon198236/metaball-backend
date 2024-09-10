const crypto = require('crypto');
const User = require('../models/user');

const create = async(data) => {
    const {email, password} = data;
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
    let status = false;
    let error;
    await user.save().then(() => {
        status = true;
    }).catch(err=> {
        console.log('faild create user.'),
        status = false;
        error = err.message;
    });
    return {status: true, error};
};

const remove_security_info = (user) => {
    delete user['salt'];
    delete user['hash'];
    delete user['created_at'];
    delete user['updated_at'];
    delete user['deleted'];
    delete user['__v'];
    return user;
}

module.exports = {
    create,
    remove_security_info,
}