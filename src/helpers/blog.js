const Blog = require('../models/blog');
const fs = require('fs');
const { UserHidenField } = require('../constants/security');

// remove a blog.
const remove = async(_id) => {
    const blog = await Blog.findOne({_id}).catch(err=> console.log(err.message));
    if (!blog) {
        return {
            status: false,
            error: 'there is no blog',
        };
    }
    if (blog['files']) {
        blog['files']?.forEach(f => {
            if(fs.existsSync(f)) {
                fs.unlinkSync(f);    
            }
        });
    }
    
    const result = await Blog.deleteOne({_id}).catch(err => {
        return {
            status: false,
            error: err.message,
        };
    });

    // remove reviews for this blog.
    Blog.deleteMany({blog: blog._id}).catch(err=> console.log(err.message));
    return {status: true, data: result};
};

const get_blogs = async(query, limit = 10, skip = 0, sort = 1) => {
    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate({
            path: 'user',
            select: UserHidenField
        })
        // .populate({
        //     path: 'theme_ids',
        //     select: {
        //         created_at: 0,
        //         updated_at: 0,
        //         __v: 0
        //     }
        // })
        .sort({created_at: sort})
        .limit(limit)
        .skip(skip)
    return {count, blogs};    
}

module.exports = {
    remove,
    get_blogs,
}