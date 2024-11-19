const Blog = require('../models/blog');
const fs = require('fs');
const { SystemActionType } = require('../constants/type');
const Review = require('../models/review');
const User = require('../models/user');
const mongoose = require('mongoose');
const {
    remove: remove_helper,
    get_blogs: get_blogs_helper,
} = require('../helpers/blog');
const SECTION = 'blog';

// create a blog
const create = async(req, res) => {
    const {currentUser} = req;
    
    const _files = req.files?.map(f => f.path);
    const {theme_ids: _theme_ids} = req.body;
    if(_theme_ids) {
        if(Array.isArray(_theme_ids))
        {
            req.body.theme_ids = _theme_ids
        }else {
            const ids = _theme_ids.split(',');
            req.body.theme_ids = ids;
        }
    }
    const blog = new Blog({
        user: currentUser._id,
        files: _files,
        ... req.body,
    });
    const result = await blog.save().catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    return res.send({status: true, code: 200, data: result});
    
};

// update the selected blog
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id, } = req.params;
    const { file_urls } = req.body;
    
    const _files = req.files?.map(f => f.path);
    
    const blog = await Blog.findOne({_id}).catch(err=> console.log(err.message));
    if (!blog) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no blog',
        })
    }

    if (_files?.length > 0 && blog['files']) {
        blog['files']?.forEach(f => {
            if( file_urls?.findIndex(e => e === f) < 0
                && fs.existsSync(f))
            {
                // do not remove the file if the file exists on keeping list
                fs.unlinkSync(f);    
            }
        });
    }
    const data = {... req.body};
    delete data.file_urls;
    
    data.files = [];
    if (file_urls) data.files = [...file_urls];
    if (_files?.length) data.files = [...file_urls, ..._files];

    const result = await Blog.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

// remove a blog
const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const {status, result, error} = await remove_helper(_id);
    if (!status) {
        return res.status(400).send({
            status,
            code: 400,
            error,
        })
    }
    return res.send({status: true, code: 200, data: result});
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
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// get a blog with _id
const get = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const query = {_id};
    const {count, blogs} = await get_blogs_helper(query, 1, 0);

    if (count == 0) {
        return res.status(400).send({
            status: false,
            code: 400,
            data: 'there is no blog',
        });    
    }
    const is_followed = currentUser.follow_blog_ids.findIndex(e => e.toString() === _id) > -1;
    return res.send({
        status: true,
        code: 200,
        data: {
            ...blogs[0]._doc,
            is_followed
        }
    })
};

// get a blog with _id
const gets = async (req, res) => {
    const { _id } = req.params;
    const { key, limit, skip} = req.query;
    
    const query = {};
    if (key) query.title = {$regex: `${key}.*`, $options:'i' };
    const {count, blogs} = await get_blogs_helper(query, limit, skip);
    return res.send({
            status: true,
            code: 200,
            data: {
                count, blogs
            }
        });
};


// get recent blogs
const get_recent = async (req, res) => {
    const { limit, skip} = req.query;
    const {count, blogs} = await get_blogs_helper({}, limit, skip, -1);
    return res.send({ status: true, code: 200, data: {count, blogs} });
};

// get my blogs
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, themes} = req.query;
    const query = { user: currentUser._id };

    if (themes) {
        query.theme_ids = {$in: themes};
    }
    const {count, blogs} = await get_blogs_helper(query, limit, skip);
    return res.send({ status: true, code: 200, data: {count, blogs} });
};

// get the specified user's blogs
const get_user = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip} = req.query;
    const { _id } = req.params;
    const query = { user: _id };
    const {count, blogs} = await get_blogs_helper(query, limit, skip);
    return res.send({ status: true, code: 200, data: {count, blogs} });
};

// get other person's blogs 
const get_others = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, themes} = req.query;
    const query = { user: {$ne: currentUser._id} };
    if (themes) {
        query.theme_ids = {$in: themes};
    }
    const {count, blogs} = await get_blogs_helper(query, limit, skip);
    return res.send({ status: true, code: 200, data: {count, blogs} });
}

// get blogs I reviewd 
const get_reviewed = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip, themes} = req.query;
    const reviewes = await Review.find({user: currentUser}).catch(err=>console.log(err.message));
    const blog_ids = reviewes.map(e => e.blog);
    const query = { _id: {$in: blog_ids} };
    
    if (themes) {
        query.theme_ids = {$in: themes};
    }
    const {count, blogs} = await get_blogs_helper(query, limit, skip);
    return res.send({ status: true, code: 200, data: {count, blogs} });
}

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
    get_mine,
    get_others,
    get_reviewed,
    get_recent,
    get_user,
}