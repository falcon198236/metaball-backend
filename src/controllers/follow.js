const Follow = require('../models/follow');
const { FollowType, SettingsType } = require('../constants/type');
const { model } = require('mongoose');
const User = require('../models/user');
const create = async(req, res) => {
    const { currentUser } = req;
    req.body.user = currentUser._id;
    const follow = new Follow({
        ... req.body,
    });
    const result = await follow.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    req.body.user = currentUser._id;
    const result = await Follow.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{created_at: {$gte: new Date('2000-1-1')}}];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    const count = await Follow.countDocuments({$and:query});
    const data = await Follow.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: limit? parseInt(limit) : 10, 
        },
        {
            $skip: skip? parseInt(skip) : 0
        },
    ]);

    return res.send({ status: true, data: {count, data} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const result = await Access.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Follow.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const data = await Follow.findOne({_id}).catch(err => console.log(err.message));
    if(!data) {
        return res.status(400).send({
            status: false,
            error: 'there is no follow',
        })
    }
    
    return res.send({
        status: true,
        data,
    });
};

const set_mark = async (req, res) => {
    const { currentUser } = req;
    const { id, type } = req.body;
    const filter = {
        user: currentUser._id,
        [type]: id  
    };
    const old_follow = await Follow.findOne(filter).catch(err => console.log(err.message));
    if (old_follow) {
        return res.status(400).send({
            status: false,
            error: 'you aleady followd him or the club',
        })
    }

    const follow = new Follow({
        user: currentUser._id,
        [type]: id,
        type,
    });
    const result = await follow.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    })
    return res.send({
        status: true,
        data: {
            result,
        },
    });
};

const unset_mark = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.query;
    const result = await Follow.deleteOne(_id).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        data: {
            result,
        },
    });
};

const get_followed = async (req, res) => {
    const { currentUser } = req;
    const { id, type, limit, skip } = req.query; // id : user or club 'id
    const filter = { type };
    const follows = await Follow.find({
        [type]: id,
        type
    })
    .sort({update_at: -1})
    .populate({path: 'person', model: User})
    .populate('club')
    .skip(skip? parseInt(skip) : 0)
    .limit(limit? parseInt(limit) : 10)
    .catch(err => console.log(err.message));

    return res.send({
        status: true,
        data: follows,
    });
};

const get_following = async (req, res) => {
    const { currentUser } = req;
    const { type, limit, skip } = req.query; // persion or club
    const follows = await Follow.find({
        user: currentUser._id,
        type
    })
    .sort({update_at: -1})
    .populate('user')
    .populate('club')
    .skip(skip? parseInt(skip) : 0)
    .limit(limit? parseInt(limit) : 10)
    .catch(err => console.log(err.message));

    return res.send({
        status: true,
        data: follows,
    });
};

module.exports = {
    // api for Admin
    create,
    update,
    remove,
    removes,
    get,
    gets,

    // api for Client
    set_mark,
    unset_mark, 
    get_followed,
    get_following,
}