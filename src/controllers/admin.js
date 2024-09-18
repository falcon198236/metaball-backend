const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const api = require('../configs/api');

const {
    create: createAdmin,
    remove_security_info,
} = require('../helpers/admin');

const create = async(req, res) => {
    const {status, error} = await createAdmin(req.body);
    if(!status) {
        return res.status(400).send({
            status,
            error,
        })
    }
    return res.send({ status });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    await User.updateOne({_id}, {$set: data}).then((_res) => {
        return res.send({
            status: true,
        })
    }).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
};

const login = async(req, res) => {
    const {email, password} = req.body;
    const admin = await User.findOne({
        $and: [
            {
                $or: [ {email: {$regex: `${email}$`, $options:'i' }},
                    {nickname: {$regex: `${email}$`, $options:'i' }}
            ]},
        ]
        }).catch(err => {
        console.log('there is no admin');
    });
    if (!admin) {
        return res.status(201).send({
            status: false,
            error: 'there is no such admin.',
        });
    }
    const hash = crypto
        .pbkdf2Sync(password, admin.salt, 10000, 512, 'sha512')
        .toString('hex');
    if(hash !== admin.hash) {
        return res.status(202).send({
            status: false,
            error: 'Invalid password.',
        });
    }
    const payload = {
        id: admin.id,
        email: admin.email,
    };
    const token = jwt.sign(payload, api.SECURITY_ADMIN_KEY);
    admin.last_login_at = new Date();
    const _admin = { ...admin._doc, last_login_at: new Date};
    User.replaceOne({_id: admin._id}, _admin, { upsert: true }).catch(err => console.log(err));
    const __admin = remove_security_info(_admin);
    
    return res.send({
        status: true,
        data: {
            token,
            user:__admin,
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
    const { currentUser} = req;
    const { key, limit, skip } = req.query;
    const query = [{role: 1}, {_id: { $nin: [currentUser._id]}}];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    console.log(query);
    const count = await User.countDocuments({$and:query});
    const users = await User.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: parseInt(limit), 
        },
        {
            $skip: parseInt(skip)
        },
        {
            $project: {
                salt: 0,
                hash: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0
            }
        }
    ]);

    return res.send({ status: true, data: {count, users} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const result = await Admin.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Admin.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const _admin = await User.findOne({_id}).catch(err => console.log(err.message));
    if(!_admin) {
        return res.status(400).send({
            status: false,
            error: 'there is no admin',
        })
    }
    const user = remove_security_info(_admin);
    return res.send({
        status: true,
        user,
    })
};
module.exports = {
    create,
    update,
    remove,
    removes,
    login,
    logout,
    get,
    gets,
}