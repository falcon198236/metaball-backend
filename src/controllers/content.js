const Content = require('../models/content');
const fs = require('fs');
const { syslog } = require('../helpers/systemlog');
const { BlogFilterType } = require('../constants/type');
const { SystemActionType, ContentType } = require('../constants/type');
const Review = require('../models/review');

const SECTION = 'content';
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const content = new Content({
        user: currentUser._id,
        files: _files,
        ... req.body,
    });
    const result = await content.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    syslog(currentUser._id, SECTION, SystemActionType.ADD, req.body);
    return res.send({status: true, data: result});
    
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
    
    const result = await Content.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({status: true, data: result});
};

const activate = async(req, res) => {
    const { _id, } = req.params;
    const { active } = req.body;
    const result = await Content.updateOne({_id}, {$set: {active}}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({status: true, data: result});
};

const remove = async (req, res) => {
    const { _id } = req.params;
    const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    if (!content) {
        return res.status(400).send({
            status: false,
            error: 'there is no content',
        });
    }
    if (content['files']) {
        content['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    
    const result = await Content.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, _id);
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    const contents = await Content.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    contents.forEach(b => {
        if (b['files']) {
            b['files']?.forEach(f => {
                if(fs.existsSync(f)) {
                    fs.unlinkSync(f);    
                }
            });
        }   
    })
    const result = await Content.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const content = await Content.findOne({_id}).catch(err => console.log(err.message));
    if (!content) {
        return res.status(201).send({
            status: false,
            error: 'there is no content',
        })
    }
    return res.send({
        status: true,
        data: content,
    })
};

const gets = async (req, res) => {
    const { type, active, key, limit, skip} = req.query;
    if (!type) {
        return res.status(400).send({
            status: false,
            error: 'please choose `type` option',
        });
    }
    const query = [{type}];
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    if (active !== undefined) {
        query.push({active});
    }
    
    const count = await Content.countDocuments({$and: query});
    const content = await Content.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        }
    ]);

    return res.send({ status: true, data: {count, content} });
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
    activate,
}