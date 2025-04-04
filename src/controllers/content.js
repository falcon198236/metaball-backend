const Content = require('../models/content');
const fs = require('fs');
const { SystemActionType, ContentType } = require('../constants/type');
const { 
    get_roundings: get_roundings_helper, 
} = require('../helpers/rounding');
const Rounding = require('../models/rounding');


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
    // const content = await Content.findOne({_id}).catch(err=> console.log(err.message));
    // if (!content) {
    //     return res.status(400).send({
    //         status: false,
    //         code: 400,
    //         error: 'there is no content',
    //     });
    // }
    // if (content['file']) {
    //     const f = content['file'];
    //     if(fs.existsSync(f)) {
    //         fs.unlinkSync(f);    
    //     }
    // }
    
    const result = await Content.updateOne({_id}, {$set: {deleted: true}}).catch(err => {
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
    // const contents = await Content.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    // contents.forEach(b => {
    //     if (b['file']) {
    //         const f = b['file'];
    //         if(fs.existsSync(f)) {
    //             fs.unlinkSync(f);    
    //         }
    //     }   
    // })
    const result = await Content.updateMany({_id: {$in: ids}}, {$set: {deleted: true}}).catch(err => {
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
    
    const content = await Content.findOne({_id, deleted: false})
        .catch(err => console.log(err.message));
    if (!content) {
        return res.status(201).send({
            status: false,
            code: 400,
            error: 'there is no content',
        })
    }
    let _rounding;
    if (content.rounding) {
        const {count, roundings} = await get_roundings_helper({_id: content.rounding}, 1, 0);
        if (count === 1) {
            _rounding = roundings[0];
        }
    }
    return res.send({
        status: true,
        code: 200,
        data: {
            ...content._doc,
            rounding: _rounding
        },
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
    const query = {type, deleted: false};
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
        deleted: false,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .populate('rounding')
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};

const get_events_club = async (req, res) => {
    const { limit, skip} = req.query;
    const { _id: club_id } = req.params;
    const roundings = await Rounding.find({
        club: club_id,
        opening_date: {$gte: new Date()},
    });
    const rounding_ids = roundings?.map(r => r._id);
    console.log(rounding_ids);
    const query = {
        type: ContentType.EVENT,
        rounding: {$in: rounding_ids},
        active: true,
        deleted: false,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .populate('rounding')
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};


const get_advertising = async (req, res) => {
    const { limit, skip} = req.query;
    const query = {
        type: ContentType.ADEVERTISING,
        active: true,
        deleted: false
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip)
    return res.send({ status: true, code: 200, data: {count, contents} });
};

const get_news = async (req, res) => {
    const { limit, skip} = req.query;
    const query = {
        type: ContentType.NEWS,
        active: true,
        deleted: false,
    };
    
    const count = await Content.countDocuments(query);
    const contents = await Content.find(query)
        .sort({created_at: -1})
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
    get_events_club,
    get_advertising,
    get_news,
}