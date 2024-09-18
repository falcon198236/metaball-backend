const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const api = require('../configs/api');

const {
    create: createUser,
    remove_security_info,
} = require('../helpers/user');

const signup = async(req, res) => {
    const {status, error} = await createUser(req.body);
    if(!status) {
        return res.status(400).send({
            status,
            error,
        })
    }
    return res.send({ status: true });
};

const update = async(req, res) => {
    const { _id } = req.params;
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
    return res.send({status: true, data: {result}});
};

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
    const token = jwt.sign(payload, api.SECURITY_KEY);
    user.last_login_at = new Date();
    const _user = { ...user._doc, last_login_at: new Date};
    await User.replaceOne({_id: user._id}, _user, { upsert: true }).catch(err => console.log(err));
    const __user = remove_security_info(_user);
    return res.send({
        status: true,
        data: {
            token,
            user: __user,
        }
    })
};

const logout = async(req, res) => {
    const {currentUser} = req;
    res.send({
        status: true,
    })
};

const gets = async (req, res) => {
    const { key, limit, skip, deleted:_deleted } = req.query;
    let deleted = _deleted;
    if(!deleted) deleted = false;
    else deleted = deleted === 'true';
    const query = [{deleted}];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await User.countDocuments({$and: query});
    const users = await User.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: parseInt(limit), 
        },
        {
            $skip: parseInt(skip)
        }
    ]);

    return res.send({ status: true, data: {count, users} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
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
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const users = await User.find({_id: {$in: _ids}}).catch(err => console.log(err.message));
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
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const _user = await User.findOne({_id}).catch(err => console.log(err.message));
    if (!_user) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        })
    }
    const user = remove_security_info(_user);
    return res.send({
        status: true,
        user,
    })
};

module.exports = {
    signup,
    update,
    remove,
    removes,
    login,
    logout,
    get,
    gets,
}