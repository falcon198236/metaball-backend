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
    
    const res = await user.save().catch(err=> {
            console.log('faild create user.')
        });
    
    return {status: true};

};


module.exports = {
    create,
}