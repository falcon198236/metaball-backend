const Access = require('../models/access');

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
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    req.body.user = currentUser._id;
    const result = await Access.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const gets = async (req, res) => {
    console.log('sssssssssssssssssssssssss');
  
    const { currentUser} = req;
    const { key, limit, skip } = req.query;
    const query = [];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await Access.countDocuments({$and:query});
    const accesses = await Access.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: parseInt(limit), 
        },
        {
            $skip: parseInt(skip)
        },
        {
            $project: {
                salt: 0,
                hash: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0
            }
        }
    ]);

    return res.send({ status: true, data: {count, data: accesses} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const result = await Access.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const result = await Access.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    console.log('ddddddddddddddddddddddddddd');
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