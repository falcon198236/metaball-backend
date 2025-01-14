const fs = require('fs');
const Location = require('../models/location');

const SECTION = 'location';
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const location = new Location({
        user: currentUser._id,
        file: _files[0] || '',
        ... req.body,
    });
    const result = await location.save().catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    return res.send({status: true, code: 200, data: result});
};

const update = async(req, res) => {
    const { _id, } = req.params;
    const _files = req.files?.map(f => f.path);
    
    const location = await Location.findOne({_id}).catch(err=> console.log(err.message));
    if (!location) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no location',
        })
    }

    if (_files?.length > 0 && location['file']) {
        const f = location['file'];
        if(fs.existsSync(f)) {
            fs.unlinkSync(f);    
        }
    }
    const data = {... req.body};
    if (_files?.length) data.file = _files[0];
    
    const result = await Location.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = {deleted: false};
    if (key) query.name = {$regex: `${key}.*`, $options:'i' }; 
    const count = await Location.countDocuments(query);
    const locations = await Location.find(query).limit(limit).skip(skip);

    return res.send({ status: true, code: 200, data: {count, locations} });
};

const remove = async (req, res) => {
    const { _id } = req.params;
    // const location = await Location.findOne({_id}).catch(err=> console.log(err.message));
    // if (!location) {
    //     return res.status(400).send({
    //         status: false,
    //         code: 400,
    //         error: 'there is no content',
    //     });
    // }
    // if (location['file']) {
    //     const f = content['file'];
    //     if(fs.existsSync(f)) {
    //         fs.unlinkSync(f);    
    //     }
    // }
    
    const result = await Location.updateOne({_id, deleted: false}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    // const locations = await Location.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    // locations.forEach(b => {
    //     if (b['file']) {
    //         const f = b['file'];
    //         if(fs.existsSync(f)) {
    //             fs.unlinkSync(f);    
    //         }
    //     }   
    // })
    const result = await Location.updateMany({_id: {$in: ids}, deleted: false}).catch(err => {
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
    const location = await Location.findOne({_id, deleted: false}).catch(err => console.log(err.message));
    if(!location) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
        code: 200,
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