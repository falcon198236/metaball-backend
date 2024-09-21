const Follow = require('../models/follow');
const { FollowType, SettingsType } = require('../constants/type');
const { model, default: mongoose } = require('mongoose');
const User = require('../models/user');
const Club = require('../models/club');
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

const setFollow = async (req, res) => {
    const { currentUser } = req;
    const { id, type } = req.body;
    const filter = {
        user: currentUser._id,
        [type]: id  
    };
    let result;
    if (type === FollowType.PERSON) {
        const index = currentUser.follow_user_ids.findIndex(e => e.toString() === id);
        if (index >= 0) {
            return res.status(200).send({
                status: false,
                error: 'you aleady followd him',
            })    
        }
        currentUser.follow_user_ids.push(mongoose.Types.ObjectId(id));
        result = await User.updateOne({_id: currentUser._id}, {
            $set: {
                follow_user_ids: currentUser.follow_user_ids,
            }
        }).catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
    } else if (type === FollowType.CLUB) {
        const index = currentUser.follow_club_ids.findIndex(e => e.toString() === id);
        if (index >= 0) {
            return res.status(200).send({
                status: false,
                error: 'you aleady followd club',
            })    
        }
        currentUser.follow_club_ids.push(mongoose.Types.ObjectId(id));
        result = await User.updateOne({_id: currentUser._id}, {
            $set: {
                follow_club_ids: currentUser.follow_club_ids,
            }
        }).catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
    }
    
    return res.send({
        status: true,
        data: {
            result,
        },
    });
};

const cancelFollow = async (req, res) => {
    const { currentUser } = req;
    const { id, type } = req.body;
    const filter = {
        user: currentUser._id,
        [type]: id  
    };
    let result;
    if (type === FollowType.PERSON) {
        const index = currentUser.follow_user_ids.findIndex(e => e.toString() === id);
        if (index < 0) {
            return res.status(200).send({
                status: false,
                error: 'you do not follow the user',
            })    
        }
        currentUser.follow_user_ids.splice(index, 1);
        result = await User.updateOne({_id: currentUser._id}, {
            $set: {
                follow_user_ids: currentUser.follow_user_ids,
            }
        }).catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
    } else if (type === FollowType.CLUB) {
        const index = currentUser.follow_club_ids.findIndex(e => e.toString() === id);
        if (index < 0) {
            return res.status(200).send({
                status: false,
                error: 'you do not follow the club.',
            })    
        }
        currentUser.follow_club_ids.splice(index, 1);
        result = await User.updateOne({_id: currentUser._id}, {
            $set: {
                follow_club_ids: currentUser.follow_club_ids,
            }
        }).catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
    }
    
    return res.send({
        status: true,
        data: {
            result,
        },
    });
};

const getFollowing = async (req, res) => {
    const { currentUser } = req;
    const { type, limit, skip } = req.query; // id : user or club 'id
    let users, clubs;
    if (type === FollowType.PERSON) {
        users = await User.find({_id: {$in: currentUser.follow_user_ids}})
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    } else if (type === FollowType.CLUB) {
        clubs = await Club.find({_id: {$in: currentUser.follow_club_ids}}).catch(err=>console.log(err.message))
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    }
    
    return res.send({
        status: true,
        data: {
            users,
            clubs,
        },
    });
};

const getFollowed = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const users = await User.find({follow_user_ids: currentUser._id})
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
        data: {
            users,
        },
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
    setFollow,
    cancelFollow, 
    getFollowed,
    getFollowing,
}