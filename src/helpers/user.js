const crypto = require('crypto');
const User = require('../models/user');
const Settings = require('../models/settings');
const Blog = require('../models/blog');
const Club = require('../models/club');
const { UserHidenField } = require('../constants/security');

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

// get user's profile with themes, clubs, blogs,...
const get_profile = async(_id) => {
    const _profile = await User.findOne({_id}, UserHidenField).catch(err => console(err.message));
    if (!_profile) {
        return {status: false};
    }
    const profile = {..._profile._doc}
    const themes = await Settings.find({_id: {$in: profile.themes}}).catch(err => err.message);
    profile['themes'] = themes;

    const clubs = await Club.find({user: _id}, {name: 1}).catch(err => err.message);
    profile['clubs'] = clubs;
    
    const follows = await User.find({_id: {$in: profile.follow_user_ids}}, {
        fullname: 1, logo: 1,
    })
            .limit(50)
            .skip(0)
            .catch(err=>console.log(err.message));
    
    profile['follows'] = follows;
    const blogs = await Blog.find({user: _id}, {title: 1, files: 1, introduction: 1,})
            .limit(50) // once, get only 50
            .skip(0)
            .catch(err => err.message);
    profile['blogs'] = blogs;
    return {status: true, profile};

}


module.exports = {
    create,
    get_profile,
}