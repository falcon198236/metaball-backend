const Location = require('../models/location');
const { syslog } = require('../helpers/systemlog');
const { SystemActionType } = require('../constants/type');

const SECTION = 'location';
const create = async(req, res) => {
    const { currentUser } = req;
    req.body.user = currentUser._id;
    const location = new Location({
        ... req.body,
    });
    const result = await location.save().catch(err => {
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
    const result = await Location.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{created_at: {$gte: new Date('2000-1-1')}}];
    if (key)
        query.push({name: {$regex: `${key}.*`, $options:'i' }});
    const count = await Location.countDocuments({$and:query});
    const locations = await Location.aggregate([
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

    return res.send({ status: true, data: {count, locations} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const result = await Location.deleteOne({_id}).catch(err => {
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
    const result = await Location.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const location = await Location.findOne({_id}).catch(err => console.log(err.message));
    if(!location) {
        return res.status(400).send({
            status: false,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
        data: location,
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