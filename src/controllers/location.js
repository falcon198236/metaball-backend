const Location = require('../models/location');

const create = async(req, res) => {
    const location = new Location({
        ... req.body,
    });
    const result = await location.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    const result = await Location.updateOne({_id}, {$set: data}).catch((err) => {
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
        query.push({name: {$regex: `${key}.*`, $options:'i' }});
    const count = await Location.countDocuments({$and:query});
    const data = await Location.aggregate([
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
    const result = await Location.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Location.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const data = await Location.findOne({_id}).catch(err => console.log(err.message));
    if(!data) {
        return res.status(400).send({
            status: false,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
        data,
    })
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
}