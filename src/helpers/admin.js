const crypto = require('crypto');
const User = require('../models/user');
const api = require('../configs/api');

const createSuperAdmin = async() => {
    const data = {
        email: api.SUPER_ADMIN_EMAIL,
        password: api.SUPER_ADMIN_PASSWORD
    }
    const _admin = await User.findOne({email:data.email}).catch(() => {});
    if(_admin) {
        return {status: false, error: 'the user is already exists.'};
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(data.password, salt, 10000, 512, 'sha512')
        .toString('hex');
    delete data['password'];
    data['hash'] = hash;
    data['salt'] = salt;
    data['role'] = 0;
    const admin = new User ({
        ...data,
    });
    let status = false;
    let error;
    await admin.save().then(() => {
        status = true;
    }).catch(err=> {
        console.log('faild create user.'),
        status = false;
        error = err.message;
    });
    return {status: true, error};
};

const create = async(data) => {
    const {email, password, role} = data;
    const _admin = await User.findOne({email}).catch(() => {});
    if(_admin) {
        return {status: false, error: 'the user is already exists.'};
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');
    delete data['password'];
    data['hash'] = hash;
    data['salt'] = salt;
    data['role'] = role || 1;
    const admin = new Admin ({
        ...data,
    });
    let status = false;
    let error;
    await admin.save().then(() => {
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
    delete user['created_at'];
    delete user['updated_at'];
    delete user['deleted'];
    delete user['__v'];
    return user;
}

module.exports = {
    createSuperAdmin,
    create,
    remove_security_info,
}