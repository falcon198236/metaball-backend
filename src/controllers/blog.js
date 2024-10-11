const Blog = require('../models/blog');
const fs = require('fs');
const { syslog } = require('../helpers/systemlog');
const { SystemActionType } = require('../constants/type');
const Review = require('../models/review');
const mongoose = require('mongoose');
const {remove: removeHelper} = require('../helpers/blog');
const SECTION = 'blog';

// create a blog
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const blog = new Blog({
        user: currentUser._id,
        files: _files,
        ... req.body,
    });
    const result = await blog.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    syslog(currentUser._id, SECTION, SystemActionType.ADD, req.body);
    return res.send({status: true, data: result});
    
};

// update the selected blog
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id, } = req.params;
    const _files = req.files?.map(f => f.path);
    
    const blog = await Blog.findOne({_id}).catch(err=> console.log(err.message));
    if (!blog) {
        return res.status(400).send({
            status: false,
            error: 'there is no blog',
        })
    }

    if (_files?.length > 0 && blog['files']) {
        blog['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    const data = {... req.body};
    if (_files?.length) data.files = _files;
    
    const result = await Blog.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.UPDATE, req.body);
    return res.send({status: true, data: result});
};

// remove a blog
const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const {status, result, error} = await removeHelper(_id);
    if (!status) {
        return res.status(400).send({
            status,
            error,
        })
    }
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, _id);
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    const blogs = await Blog.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    blogs.forEach(b => {
        if (b['files']) {
            b['files']?.forEach(f => {
                if(fs.existsSync(f)) {
                    fs.unlinkSync(f);    
                }
            });
        }   
    })
    const result = await Blog.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    syslog(currentUser._id, SECTION, SystemActionType.DELETE, ids);
    return res.send({status: true, data: result});
};

// get a blog with _id
const get = async (req, res) => {
    const { _id } = req.params;
    const blogs = await Blog.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(_id)},
        },
        {
            $lookup: {
                from: 'settings',
                localField: 'theme_id',
                foreignField: "_id",
                as: "theme_info"
            }
        },
        {
            $unwind: {
              path: "$theme_info",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: 1, 
        }
    ]).catch(err => {
        return res.status(400).send({
            status: false,
            err: err.message,
        })
    });
    if (blogs.length > 0) {
        return res.send({
            status: true,
            data: blogs[0]
        })
    }
    return res.send({
        status: true,
        data: 'there is no blog',
    })
};

// get my blogs
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, theme} = req.query;
    const query = [{ user: currentUser._id }];
    if (theme) {
        query.push({theme_id: new mongoose.Types.ObjectId(theme)})
    }
    const count = await Blog.countDocuments({$and: query});
    const blogs = await Blog.aggregate([
        {
            $match: {$and: query},
        },
        {
            $lookup: {
                from: 'settings',
                localField: 'theme_id',
                foreignField: "_id",
                as: "theme_info"
            }
        },
        {
            $unwind: {
              path: "$theme_info",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        }
    ]).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    return res.send({ status: true, data: {count, blogs} });
};

// get other person's blogs 
const get_others = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, theme} = req.query;
    const query = [{ user: {$ne: currentUser._id} }];
    if (theme) {
        query.push({theme_id: new mongoose.Types.ObjectId(theme)})
    }
    const count = await Blog.countDocuments({$and: query});
    const blogs = await Blog.aggregate([
        {
            $match: {$and: query},
        },
        {
            $lookup: {
                from: 'settings',
                localField: 'theme_id',
                foreignField: "_id",
                as: "theme_info"
            }
        },
        {
            $unwind: {
              path: "$theme_info",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        }
    ]).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {count, blogs} });
}

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    get_mine,
    get_others,
}