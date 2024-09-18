const Content = require('../models/content');
const fs = require('fs');
const path = require('path');
const api = require('../configs/api');



const create = async(req, res) => {
    const {currentUser} = req;
    const { title, intro, type } = req.body; 
    const _files = req.files?.map(f => f.path);
    const content = new Content({
        user: currentUser._id,
        title,
        intro,
        files: _files,
        type,
    });
    const result = await content.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    })
    return res.send({status: true, data: {result}});
    
};

const update = async(req, res) => {
    const { _id, } = req.params;
    const _files = req.files?.map(f => f.path);
    
    const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    if (!content) {
        return res.status(400).send({
            status: false,
            error: 'there is no content',
        })
    }

    if (_files?.length > 0 && content['files']) {
        content['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    const data = {... req.body};
    if (_files?.length) data.files = _files;
    
    await Content.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true});
};


const remove = async (req, res) => {
    const { _id } = req.params;
    const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    if (!content) {
        return res.status(400).send({
            status: false,
            error: 'there is no blog',
        });
    }
    if (content['files']) {
        content['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    
    await Content.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    const contents = await Content.find({_id: {$in: _ids}}).catch(err => console.log(err.message));
    contents.forEach(b => {
        if (b['files']) {
            b['files']?.forEach(f => {
                if(fs.existsSync(f)) {
                    fs.unlinkSync(f);    
                }
            });
        }   
    })
    const result = await Content.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const data = await Content.findOne({_id}).catch(err => console.log(err.message));
    if (!content) {
        return res.status(201).send({
            status: false,
            error: 'there is no user',
        })
    }
    return res.send({
        status: true,
        data,
    })
};

const gets = async (req, res) => {
    const { type, key, limit, skip} = req.query;
    const query = [{type}];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await Content.countDocuments({$and: query});
    const data = await Content.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: parseInt(limit), 
        },
        {
            $skip: parseInt(skip)
        }
    ]);

    return res.send({ status: true, data: {count, data} });
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets
}