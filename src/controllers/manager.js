const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const api = require('../configs/api');
const { SystemActionType } = require('../constants/type');
const {
    create: createManager,
} = require('../helpers/manager');
const SECTION = 'manager';
const create = async(req, res) => {
    const { currentUser } = req; 
    req.body.role = 1;
    const {status, code, data, error} = await createManager(req.body);
    
    if(!status) {
        return res.status(code).send({
            status,
            code,
            error,
        })
    }
    return res.send({ status, data, code: 200, });
};

const update = async(req, res) => {
    const { _id } = req.params;
    const result = await User.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    return res.send({
        status: true,
        code: 200,
        data: result,
    })
};

const verify = async(req, res) => {
    const {currentUser} = req;
    return res.send({
        status: true,
        code: 200,
        data: {
            manager: currentUser,
        }
    })
}
const login = async(req, res) => {
    const {email, password} = req.body;
    console.log('ADMIN LOGIN: [', email ,']', req.body);
    const manager = await User.findOne({
        $and: [
            {
                $or: [ {email: {$regex: `${email}$`, $options:'i' }},
                    {nickname: {$regex: `${email}$`, $options:'i' }}
            ]},
            { role: {$in: [0, 1]}},
        ]
        }).catch(err => {
        console.log('there is no admin');
    });
    if (!manager) {
        return res.status(201).send({
            status: false,
            code: 201,
            error: 'there is no such admin.',
        });
    }
    const hash = crypto
        .pbkdf2Sync(password, manager.salt, 10000, 512, 'sha512')
        .toString('hex');
    if(hash !== manager.hash) {
        return res.status(202).send({
            status: false,
            code: 202,
            error: 'Invalid password.',

        });
    }
    const payload = {
        id: manager.id,
        email: manager.email,
    };
    const token = jwt.sign(payload, api.SECURITY_ADMIN_KEY);
    
    User.updateOne({_id: manager._id}, {
        $set: {
            last_login_at: new Date(),
        }
    }).catch(err => console.log(err.message));
    
    return res.send({
        status: true,
        code: 200,
        data: {
            token,
            manager,
        }
    })
};

const logout = async(req, res) => {
    const {currentUser} = req;
    
    return res.send({
        status: true,
        code: 200,
    })
};

const gets = async (req, res) => {
    const { currentUser} = req;
    const { key, limit, skip } = req.query;
    const query = {role: 1, _id: { $nin: [currentUser._id]}, deleted: false};
    if (key)
        query.email = {$regex: `${key}.*`, $options:'i' };
    
    const count = await User.countDocuments(query);
    const managers = await User.find(
        query,
        {
            average_score: 0, 
            month_average_score: 0,
            best_score: 0,
            follow_user_ids: 0,
            follow_club_ids: 0,
            experience_years: 0,
            themes: 0,
            salt: 0,
            hash: 0,
            created_at: 0,
            updated_at: 0,
            role: 0,
            deleted: 0,
            __v: 0
        }
    )
    .limit(limit)
    .skip(skip);

    return res.send({ status: true, code: 200, data: {count, managers} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const result = await User.updateOne({_id, deleted: false}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const removes = async (req, res) => {
    const {currentUser} = req;
    const { ids } = req.body;
    const result = await User.updateMany({_id: {$in: ids}, deleted: false}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });

    return res.send({status: true, code: 200, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const _manager = await User.findOne({_id}, {
        average_score: 0, 
        month_average_score: 0,
        best_score: 0,
        follow_user_ids: 0,
        follow_club_ids: 0,
        experience_years: 0,
        themes: 0,
        salt: 0,
        hash: 0,
        created_at: 0,
        updated_at: 0,
        role: 0,
        deleted: 0,
        __v: 0
    }).catch(err => console.log(err.message));
    if(!_manager) {
        return res.status(400).send({
            status: false,
            error: 'there is no admin',
        })
    }
    return res.send({
        status: true,
        code: 200,
        data: _manager,
    })
};
// change paassword of current manager
const change_password = async (req, res) => {
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
            code: 400,
            error: err.message,
        })
    });

    return res.send({
        status: true,
        code: 200,
        data: result,
    })
}

const resetPassword = async (req, res) => {
    const { _id, password } = req.body;

    const manager = await User.findOne({_id}).catch(err => console.log(err.message));
    if (!manager) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user.',
        })
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');
    const result = await User.updateOne({ _id}, {
        $set: {
            salt,
            hash,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    return res.send({
        status: true,
        code: 200,
        data: result,
    })
}
module.exports = {
    create,
    update,
    remove,
    removes,
    verify,
    login,
    logout,
    get,
    gets,
    change_password,
    resetPassword,
}