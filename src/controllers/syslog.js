const mongoose = require('mongoose');
const Systemlog = require('../models/systemlog');
const { UserHidenField } = require('../constants/security');

// remove a review
const remove = async (req, res) => {
    const { _id } = req.params;
    const syslog = await Systemlog.findOne({_id}).catch(err=> console.log(err.message));
    if (!review) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no review',
        });
    }
    const result = await Systemlog.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
};

// remove the selected reviews.
const removes = async (req, res) => {
    const { ids } = req.body;
    const result = await Systemlog.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
};


// get the review information
const get = async (req, res) => {
    const { _id } = req.params;
    const review = await Systemlog.findOne({_id}).catch(err => console.log(err.message));
    if (!review) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no log',
        })
    }
    return res.send({
        status: true,
        code: 200,
        data: review,
    })
};

// get Syslog
const gets = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, key, type, code} = req.query;
    const query = {};
    if (key) {
        query.action = {$regex: `${key}`, $options:'i' };
    }
    if (type) {
        query.type = type;
    }
    if (code) {
        query.code = code;
    }
    console.log(query);
    const count = await Systemlog.countDocuments(query);
    const syslogs = await Systemlog.find(query).populate({
        path: 'user',
        select: {
            _id: 1,
            email: 1,
            role: 1
        }
    })
        .sort({
            created_at: -1,
        })
        .limit(limit)
        .skip(skip)
        .catch(err=> console.log(err.message));

    return res.send({ status: true, code: 200, data: {count, syslogs} });
};


module.exports = {
    remove,
    removes,
    get,
    gets,
}