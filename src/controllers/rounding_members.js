const mongoose = require('mongoose');
const Rounding = require('../models/rounding');
const User = require('../models/user');
const { UserHidenField } = require('../constants/security')

// create a rounding
const create = async(req, res) => {
    const {currentUser} = req;
    if (currentUser.role === 2) {
        req.body.user = currentUser._id;
    }
    const rounding = new Rounding({
        ... req.body,
    });
    
    const result = await rounding.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};
// update the rounding
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const result = await Rounding.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};
// get roundings 
const gets = async (req, res) => {
    const { key, limit, skip, start_date, end_date } = req.query;
    const query = [{createdAt: new Date('2000-1-1')}];
    if (start_data) 
        query.push({opening_date: {$gte: start_date}});
    if (end_data) 
        query.push({opening_date: {$lte: end_date}})
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    const count = await Rounding.countDocuments({$and:query});
    const data = await Rounding.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip,
        },
    ]);

    return res.send({ status: true, data: {count, data} });
};

// remove a rounding
const remove = async (req, res) => {
    const { _id } = req.params;
    const result = await Rounding.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// removed the selected roundings
const removes = async (req, res) => {
    const { ids } = req.body;
    
    const result = await Rounding.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// get the detail of the Rounding.
const get = async (req, res) => {
    const { _id } = req.params;
    const rounding = await Rounding.findOne({_id})
        .populate({
            path: 'user',
            select: UserHidenField
        })
    .catch(err => console.log(err.message));
    if(!rounding) {
        return res.status(400).send({
            status: false,
            error: 'there is no rounding',
        })
    }
    let members = [];
    if (rounding.members.length > 0) {
        members = await User.find({_id: {$in: rounding.members}}, UserHidenField).catch(err => console.log(err.message));
    }
    
    return res.send({
        status: true,
        data: {
            rounding,
            members
        },
    })
};

// get the roundings that I created.
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const roundings = await Rounding.find({user: currentUser._id}).catch(err => console.log(err.message));
    return res.send({ status: true, data: roundings });
};

// get the roundings to proceed on the selected date.
const get_date = async (req, res) => {
    const { limit, skip, date } = req.body;
    const start_date = new Date(date.setHours(0,0,0, 0));
    const end_date = new Date(date.setHours(23,59,59, 999));
    const roundings = await Rounding.aggregate([
        {
            $match: {
                opening_date: {
                $gte: start_date,
                $lt: end_date,
            }},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip,
        },
    ]).catch(err => console.log(err.message));
    
    return res.send({status: true, data: roundings});
};

// get roundings to proceed recently
const get_recent = async (req, res) => {
    const { limit, skip, } = req.query;
    const start_date = new Date();
    const query = {
        opening_date: {
            $gte: start_date,
        }
    };
    const count = await Rounding.countDocuments(query);
    const roundings = await Rounding.aggregate([
        {
            $match: query,
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        },
        {
            $sort: {
                opening_date: -1,
            }
        },
    ]).catch(err => console.log(err.message));
    
    return res.send({status: true, data: 
        {
            count,
            roundings,
        }
    });
};

// get users who can gather.
const get_gather_users = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.params;
    const {limit, skip, sex, location, address, hit, start_age, end_age} = req.query;
    const rounding = await Rounding.findOne({_id}).catch(err => console.log(err.message));
    if (!rounding) {
        return res.status(400).send({
            status: false,
            error: 'there is no the rounding.',
        })
    }
    const query = [];
    const rounding_members = rounding.members;
    rounding_members.push(currentUser._id);
    if (rounding_members.length > 0) {
        query.push({_id: {$nin: rounding_members}});
    }
    if (location) {
        query.push({location});
    }
    let date;
    if (start_age) {
        date = new Date();
        date = new Date(date.setFullYear(date.getFullYear() - start_age));
        query.push({birthday: {$lte: new Date(date)}});
    }
    if (end_age) {
        date = new Date();
        date = new Date(date.setFullYear(date.getFullYear() - end_age));
        query.push({birthday: {$gte: new Date(date)}});
    }
    if (sex) {
        query.push({sex});
    }
    if (hit) {
        query.push({average_score: hit})
    }
    if (address) query.push({address: {$regex: `${address}.*`, $options:'i' }});
    const count = await User.countDocuments({$and: query});
    const users = await User.find({$and: query}, UserHidenField)
    .skip(skip)
    .limit(limit)
    .catch(err => {
        console.log(err.message);
    });
    return res.send({
        status: true,
        data: {
            count,
            users,
        }
    })  
};

// add a user on this rounding
const add_user = async (req, res) => {
    const {currentUser} = req;
    const { _id, user} = req.body;
    const rounding = await Rounding.findOne({_id}).catch(err => console.log(err.message));
    if (!rounding) {
        return res.status(400).send({
            status: false,
            error: 'there is no the rounding.',
        })
    }
    const a = rounding.members.findIndex(e => e.toString() == user);
    if (a >= 0) {
        return res.status(201).send({
            status: false,
            error: 'the user already added',
        })
    }
    const members = [...rounding.members, new mongoose.Types.ObjectId(user)];
    const result = await Rounding.updateOne({_id}, {
        $set: {
            members,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    })
    return res.send({status: true, data: result});
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    get_mine,
    get_date,
    get_recent,
    get_gather_users,
    add_user,
}