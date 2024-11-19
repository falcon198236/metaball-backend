const Access = require('../models/access');
const { SystemActionType } = require('../constants/type');
const SECTION = 'manager';

const create = async(req, res) => {
    const { currentUser } = req;
    req.body.user = currentUser._id;
    const access = new Access({
        ... req.body,
    });
    const result = await access.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, code: 200, data: result });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const {_id} = req.params;
    req.body.user = currentUser._id;
    const result = await Access.updateOne({_id}, {$set: req.body}).catch((err) => {
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
    const count = await Access.countDocuments(query);
    const accesses = await Access.find(query)
        .limit(limit)
        .skip(skip);

    return res.send({ status: true, code: 200, data: {count, accesses} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const result = await Access.deleteOne({_id}).catch(err => {
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
    
    const result = await Access.deleteMany({_id: {$in: ids}}).catch(err => {
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
    const access = await Access.findOne({_id}).catch(err => console.log(err.message));
    if(!access) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
        code: 200,
        data: access,
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