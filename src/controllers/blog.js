const Blog = require('../models/blog');
const fs = require('fs');
const path = require('path');
const api = require('../configs/api');



const create = async(req, res) => {
    const {currentUser} = req;
    const { title, intro } = req.body; 
    const _files = req.files?.map(f => f.path);
    const blog = new Blog({
        user: currentUser._id,
        title,
        intro,
        files: _files,
    });
    const result = await blog.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    })
    return res.send({status: true, data: {result}});
    
};

const update = async(req, res) => {
    const {_id, data} = req.body;
    await Blog.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({status: true});
};

const update_file = async(req, res) => {
    
}

const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    
    const blog = await Blog.findOne({_id}).catch(err=> console.log(err.message));
    if (!blog) {
        return res.status(400).send({
            status: false,
            error: 'there is no blog',
        });
    }
    if (blog['files']) {
        blog['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    
    Blog.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    const blogs = await Blog.find({_id: {$in: _ids}}).catch(err => console.log(err.message));
    blogs.forEach(b => {
        if (b['files']) {
            b['files']?.forEach(f => {
                if(fs.existsSync(f)) {
                    fs.unlinkSync(f);    
                }
            });
        }   
    })
    const result = await Blog.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result: 0}});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const _blog = await Blog.findById(_id).catch(err => console.log('find blog falid', err.message));
    if (!_blog) {
        return res.status(201).send({
            status: false,
            error: 'there is no user',
        })
    }
    return res.send({
        status: true,
        blog: _blog._doc,
    })
};

const gets = async (req, res) => {
    const { key, limit, skip} = req.query;
    const query = [];
    if (key)
        query.push({email: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await Blog.countDocuments({$and: query});
    const blogs = await Blog.aggregate([
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

    return res.send({ status: true, data: {count, blogs} });
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets
}