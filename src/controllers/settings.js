const { SettingsType } = require('../constants/type');
const Settings = require('../models/settings');
const { syslog } = require('../helpers/systemlog');
const { SystemActionType } = require('../constants/type');

const SECTION = 'settings';
const create = async(req, res) => {
    const {currentUser} = req;
    const settings = new Settings({
        ... req.body,
    });
    const result = await settings.save().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    syslog(currentUser._id, SECTION, SystemActionType.ADD, req.body);
    return res.send({ status: true, data: result });
};

const update = async(req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const result = await Settings.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({ status: true, data: result });
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
            $limit: limit, 
        },
        {
            $skip: skip,
        },
    ]);

    return res.send({ status: true, data: {count, data} });
};

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const result = await Settings.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, _id);
    return res.send({status: true, data: result });
};

const removes = async (req, res) => {
    const {currentUser} = req;
    const { ids } = req.body;
    
    const result = await Settings.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({ status: true, data: result });
};

const get = async (req, res) => {
    const { _id } = req.params;
    const settings = await Settings.findOne({_id}).catch(err => console.log(err.message));
    if(!settings) {
        return res.status(400).send({
            status: false,
            error: 'there is no access',
        })
    }
    
    return res.send({
        status: true,
        data: settings,
    })
};

// it should be used on client side
const get_type_hit = async (req, res) => {
    const data = await Settings.find({type: SettingsType.HIT}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

// user's themes
const get_type_user_theme = async (req, res) => {
    const data = await Settings.find({type: SettingsType.THEME}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

// user's themes
const get_type_blog_theme = async (req, res) => {
    const data = await Settings.find({type: SettingsType.BLOG}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};

const get_type_experience = async (req, res) => {
    const data = await Settings.find({type: SettingsType.EXPERIENCE}).sort({title: 1}).catch(err=>console.log(err.message));
    return res.send({status: true, data});
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    get_type_hit,
    get_type_experience,
    get_type_user_theme,
    get_type_blog_theme,
}