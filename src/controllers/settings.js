const fs = require('fs');
const { SettingsType } = require('../constants/type');
const Settings = require('../models/settings');
const { SystemActionType } = require('../constants/type');

const SECTION = 'settings';
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);

    const settings = new Settings({
        ... req.body,
        file: _files?.length?_files[0] : ''
    });
    const result = await settings.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    return res.send({ status: true, data: result });
};

const update = async(req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const _files = req.files?.map(f => f.path);

    const setting = await Settings.findOne({_id}).catch(err=> console.log(err.message));
    if (!setting) {
        return res.status(400).send({
            status: false,
            error: 'there is no setting',
        })
    }

    if (_files?.length > 0 && setting['file']) {
        const f = setting['file'];
        if(fs.existsSync(f)) {
            fs.unlinkSync(f);    
        }
    }
    const data = {... req.body};
    if (_files?.length) data.file = _files[0];

    const result = await Settings.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    return res.send({ status: true, data: result });
};

const gets = async (req, res) => {
    const { type, key, limit, skip } = req.query;
    const query = {type, deleted: false};
    if (key)
        query.title = {$regex: `${key}.*`, $options:'i' };
    const count = await Settings.countDocuments(query);
    const data = await Settings.find(query)
        .limit(limit).skip(skip);
    return res.send({ status: true, data: {count, data} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const result = await Settings.updateOne({_id}, {$set: {deleted: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });

    return res.send({status: true, data: result });
};

const removes = async (req, res) => {
    const {currentUser} = req;
    const { ids } = req.body;
    
    const result = await Settings.updateMany({_id: {$in: ids}}, {$set: {deleted: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });

    return res.send({ status: true, data: result });
};

const get = async (req, res) => {
    const { _id } = req.params;
    const settings = await Settings.findOne({_id, deleted: false}).catch(err => console.log(err.message));
    if(!settings) {
        return res.status(400).send({
            status: false,
            error: 'there is no settings',
        })
    }
    
    return res.send({
        status: true,
        data: settings,
    })
};

const activate = async(req, res) => {
    const { _id, } = req.params;
    const { active } = req.body;
    const result = await Settings.updateOne({_id}, {$set: {active}}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

// it should be used on client side
const get_type_hit = async (req, res) => {
    const data = await Settings.find({type: SettingsType.HIT, active: true, deleted: false}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

// user's themes
const get_type_user_theme = async (req, res) => {
    const data = await Settings.find({type: SettingsType.THEME, deleted: false}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

// user's themes
const get_type_blog_theme = async (req, res) => {
    const data = await Settings.find({type: SettingsType.BLOG, active: true, deleted: false}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_experience = async (req, res) => {
    const data = await Settings.find({type: SettingsType.EXPERIENCE, active: true, deleted: false}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
    activate,

    get_type_hit,
    get_type_experience,
    get_type_user_theme,
    get_type_blog_theme,
}