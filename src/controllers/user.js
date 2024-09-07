const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const api = require('../configs/api');

const {
    create: createUser,
    login: loginUser,
} = require('../helpers/user');

const signup = async(req, res) => {
    const {status, error} = await createUser(req.body);
    if(!status) {
        return res.status(400).send({
            status,
            error,
        })
    }
    return res.send({ status });
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
    User.replaceOne({_id: user._id}, _user, { upsert: true }).catch(err => console.log(err));
    delete _user['hash'];
    delete _user['salt'];
    delete _user['created_at'];
    delete _user['updated_at'];
    delete _user['deleted'];
    return res.send({
        status: true,
        data: {
            token,
            _user,
        }
    })
};

const getUsers = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = {email: {$regex: `${key}.*`, $options:'i' }};
    
    const count = await User.countDocuments(query);
    const users = await User.aggregate([
        {
            $match: query,
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


module.exports = {
    signup,
    login,
    getUsers,
}