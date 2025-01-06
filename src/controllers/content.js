const Content = require('../models/content');
const fs = require('fs');
const { SystemActionType, ContentType } = require('../constants/type');
const Review = require('../models/review');

const SECTION = 'content';
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const content = new Content({
        user: currentUser._id,
        file: _files[0] || '',
        ... req.body,
    });
    const result = await content.save().catch((err) => {
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
    
    const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    if (!content) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no content',
        })
    }

    if (_files?.length > 0 && content['file']) {
        const f = content['file'];
        if(fs.existsSync(f)) {
            fs.unlinkSync(f);    
        }
    }
    const data = {... req.body};
    if (_files?.length) data.file = _files[0];
    
    const result = await Content.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

const activate = async(req, res) => {
    const { _id, } = req.params;
    const { active } = req.body;
    const result = await Content.updateOne({_id}, {$set: {active}}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const remove = async (req, res) => {
    const { _id } = req.params;
    const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    if (!content) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no content',
        });
    }
    if (content['file']) {
        const f = content['file'];
        if(fs.existsSync(f)) {
            fs.unlinkSync(f);    
        }
    }
    
    const result = await Content.deleteOne({_id}).catch(err => {
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
    const contents = await Content.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    contents.forEach(b => {
        if (b['file']) {
            const f = b['file'];
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        }   
    })
    const result = await Content.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    
    const content = await Content.findOne({_id})
        .populate({
            path: 'rounding',
            select: {
                _id: 1,
                title: 1,
                introduction: 1,
                place: 1,
            }
        })
        .catch(err => console.log(err.message));
    if (!content) {
        return res.status(201).send({
            status: false,
            code: 400,
            error: 'there is no content',
        })
    }
    return res.send({
        status: true,
        code: 200,
        data: content,
    })
};

const gets = async (req, res) => {
    const { type, active, key, limit, skip} = req.query;
    if (!type) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'please choose `type` option',
        });
    }
    const query = {type};
    if (key)
        query.title = {$regex: `${key}.*`, $options:'i' };
    if (active !== undefined) {
        query.active = active;
    }
    const count = await Content.countDocuments(query);
    const content = await Content.find(query)
        .populate('rounding')
        .limit(limit)
        .skip(skip);

    return res.send({ status: true, code: 200, data: {count, content} });
};

const get_events = async (req, res) => {
    const { limit, skip} = req.query;
    const query = {
        type: ContentType.EVENT,
        active: true,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .populate('rounding')
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};

const get_advertising = async (req, res) => {
    const { limit, skip} = req.query;
    const query = {
        type: ContentType.ADEVERTISING,
        active: true,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};

const get_news = async (req, res) => {
    const { limit, skip} = req.query;
    const query = {
        type: ContentType.NEWS,
        active: true,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
    activate,

    get_events,
    get_advertising,
    get_news,
}