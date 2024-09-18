const Rounding = require('../models/rounding');

const create = async(req, res) => {
    const rounding = new Rounding({
        ... req.body,
    });
    const result = await Rounding.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    const result = await Rounding.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{createdAt: new Date('2000-1-1')}];
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    const count = await Rounding.countDocuments({$and:query});
    const data = await Rounding.aggregate([
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
    const { _id } = req.params;
    const result = await Rounding.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Rounding.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const data = await Rounding.findOne({_id}).catch(err => console.log(err.message));
    if(!data) {
        return res.status(400).send({
            status: false,
            error: 'there is no rounding',
        })
    }
    
    return res.send({
        status: true,
        data,
    })
};

// it should be used on client side
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const roundings = await Rounding.find({user: currentUser._id}).catch(err => console.log(err.message));
    return res.send({ status: true, data: { roundings} });
};

const get_recently = async (req, res) => {
    const { limit, skip } = req.body;
    const now = new Date();
    const roundings = await Rounding.aggregate([
        {
            $match: {start_time: {$gte: now}},
        },
        {
            $limit: limit? parseInt(limit) : 10, 
        },
        {
            $skip: skip? parseInt(skip) : 0
        },
    ]).catch(err => console.log(err.message));
    
    return res.send({status: true, data: { roundings}});
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    get_mine,
    get_recently,
}