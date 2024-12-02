const GolfAddress = require('../models/golfcourse');

const create = async(req, res) => {
    const golfaddress = new GolfAddress({
        ... req.body,
    });
    const result = await golfaddress.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, code: 200, data: result });
};

const update = async(req, res) => {
    const {_id} = req.params;
    const result = await GolfAddress.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    return res.send({ status: true, code: 200, data: result });
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = {};
    if (key)
        query.title ={$regex: `${key}.*`, $options:'i' };
    const count = await GolfAddress.countDocuments(query);
    const golfcourses = await GolfAddress.find(query)
        .limit(limit)
        .skip(skip);

    return res.send({ status: true, code: 200, data: {count, golfcourses} });
};

const remove = async (req, res) => {
    const { _id } = req.params;
    const result = await GolfAddress.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    
    const result = await GolfAddress.deleteMany({_id: {$in: ids}}).catch(err => {
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
    const golfcourse = await GolfAddress.findOne({_id}).catch(err => console.log(err.message));
    if(!golfcourse) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no golfcourse',
        })
    }
    
    return res.send({
        status: true,
        code: 200,
        data: golfcourse,
    });
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
}