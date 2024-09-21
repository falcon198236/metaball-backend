const Access = require('../models/access');
const { syslog } = require('../helpers/systemlog');
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
    syslog(currentUser._id, SECTION, SystemActionType.ADD, req.body);
    return res.send({ status: true, data: result });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const {_id} = req.params;
    req.body.user = currentUser._id;
    const result = await Access.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({ status: true, data: result });
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{created_at: {$gte: new Date('2000-1-1')}}];
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    const count = await Access.countDocuments({$and:query});
    const accesses = await Access.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        },
    ]);

    return res.send({ status: true, data: {count, accesses} });
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
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, _id);
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const {currentUser} = req;
    const { ids } = req.body;
    
    const result = await Access.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const access = await Access.findOne({_id}).catch(err => console.log(err.message));
    if(!access) {
        return res.status(400).send({
            status: false,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
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