const Settings = require('../models/settings');

const create = async(req, res) => {
    const settings = new Settings({
        ... req.body,
    });
    const result = await Settings.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    const result = await Settings.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const gets = async (req, res) => {
    const { type, key, limit, skip } = req.query;
    const query = [{type}];
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    const count = await Settings.countDocuments({$and:query});
    const data = await Settings.aggregate([
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
    const result = await Settings.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Settings.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const data = await Settings.findOne({_id}).catch(err => console.log(err.message));
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

// it should be used on client side
const get_type_life = async (req, res) => {
    const data = await Settings.find({type: 'life'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_hit = async (req, res) => {
    const data = await Settings.find({type: 'hit'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_experience = async (req, res) => {
    const data = await Settings.find({type: 'experience'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_note = async (req, res) => {
    const data = await Settings.find({type: 'note'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_invitor = async (req, res) => {
    const data = await Settings.find({type: 'invitor'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_roudning = async (req, res) => {
    const data = await Settings.find({type: 'roudning'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_theme = async (req, res) => {
    const data = await Settings.find({type: 'theme'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_meeting = async (req, res) => {
    const data = await Settings.find({type: 'meeting'}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    get_type_life,
    get_type_hit,
    get_type_experience,
    get_type_note,
    get_type_invitor,
    get_type_roudning,
    get_type_theme,
    get_type_meeting,
}