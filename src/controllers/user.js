const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Settings = require('../models/settings');
const Club = require('../models/club');
const Blog = require('../models/blog');
const api = require('../configs/api');
const { syslog } = require('../helpers/systemlog');
const { SystemActionType } = require('../constants/type');

const {
    create: createUser,
    get_profile,
} = require('../helpers/user');
const { UserHidenField } = require('../constants/security');

const SECTION = 'user';
const signup = async(req, res) => {
    req.body.role = 2;
    const _files = req.files?.map(f => f.path);
    if (_files?.length) {
        req.body['logo'] = _files[0];
    }
    const {status, data, error} = await createUser(req.body);
    if(!status) {
        return res.status(400).send({
            status,
            error,
        })
    }
    syslog(data._id, SECTION, SystemActionType.SIGNUP, req.body);
    return res.send({ status: true, data });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const { _id: id } = req.params;
    let _id = id;
    if ( !id ) _id = currentUser._id;
    const _files = req.files?.map(f => f.path);
    const user = await User.findOne({_id}).catch(err=> console.log(err.message));
    if (!user) {
        return res.status(400).send({status: false, error: 'there is no user'});
    }
    if (_files?.length) {
        if (user.logo) {
            try {
                fs.unlinkSync(user.logo);
            }catch(err) {
                console.log(err.message);
            }
        }
        req.body['logo'] = _files[0];
    }
    const result = await User.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({status: true, data: result});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{role: { $nin: [0, 1]}}];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await User.countDocuments({$and: query});
    const users = await User.aggregate([
        {
            $match: {$and: query},
        },
        {
            $project: UserHidenField
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        }, 
        
    ]);

    return res.send({ status: true, data: {count, users} });
};

const remove = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const user = await User.findOne({_id}).catch(err => console.log(err.message));
    if (!user) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        });
    }

    if (user['logo']) {
        if(fs.existsSync(user['logo'])) {
            fs.unlinkSync(user['logo']);    
        }
    }
    const result = await User.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, _id);
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const { currentUser } = req;
    const { ids } = req.body;
    
    const users = await User.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    users.forEach(u => {
        if (u['logo']) {
            if(fs.existsSync(u['logo'])) {
                fs.unlinkSync(u['logo']);    
            }
        }   
    });

    const result = await User.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const _user = await User.findOne({_id}, UserHidenField).catch(err => console.log(err.message));
    if (!_user) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        })
    }
    return res.send({
        status: true,
        data: user,
    })
};

///////////////////////// CLIENT ///////////////////////////////
const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({
        $and: [
            {
                $or: [ {email: {$regex: `${email}$`, $options:'i' }},
                    {nickname: {$regex: `${email}$`, $options:'i' }}
            ]},
            { deleted: false },
        ]
        }).catch(err => {
        console.log('there is no user');
    });
    if (!user) {
        return res.status(201).send({
            status: false,
            error: 'there is no such user.',
        });
    }
    const hash = crypto
        .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
        .toString('hex');
    if(hash !== user.hash) {
        return res.status(202).send({
            status: false,
            error: 'Invalid password.',
        });
    }
    const payload = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone
    };
    const token = jwt.sign(payload, api.SECURITY_KEY, {
        expiresIn: 86400 // expires in 24 hours //86400
    });
    user.last_login_at = new Date();
    const _user = { ...user._doc, last_login_at: new Date};
    await User.replaceOne({_id: user._id}, _user, { upsert: true }).catch(err => console.log(err));
    syslog(user._id, SECTION, SystemActionType.LOGIN);
    return res.send({
        status: true,
        data: {
            token,
            user: _user,
        }
    })
};

const logout = async(req, res) => {
    const {currentUser} = req;
    syslog(currentUser._id, SECTION, SystemActionType.LOGOUT);

    res.send({
        status: true,
    })
};

// get my profile
const me = async (req, res) => {
    const { currentUser } = req;
    const {status, profile} = await get_profile(currentUser._id);
    if (!status) {
        return res.status(400).send({
            status,
            error: 'there is no such user'
        })
    }
    return res.send({
        status,
        data: profile,
    });
};

// get my profile
const profile = async (req, res) => {
    const { _id } = req.params;
    const {status, profile} = await get_profile(_id);
    if (!status) {
        return res.status(400).send({
            status,
            error: 'there is no such user'
        })
    }
    return res.send({
        status,
        data: profile,
    });
};

const changePassword = async (req, res) => {
    const { currentUser } = req;
    const { password } = req.body;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');
    const result = await User.updateOne({ _id: currentUser._id}, {
        $set: {
            salt,
            hash,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, password);
    return res.send({
        status: true,
        data: result,
    })
};

const forgot = async (req, res) => {
    const { email } = req.body;
    // send email
    return res.send({
        status: true,
    })
}
////////////////////////////////////////////////////////////////

module.exports = {
    remove,
    removes,
    login,
    logout,
    get,
    gets,

    ////////////////// client ///////////////////
    signup,
    update,
    me,
    profile,
    changePassword,
    forgot,
}