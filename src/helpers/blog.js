const crypto = require('crypto');
const Blog = require('../models/blog');
const Review   = require('../models/review');

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
    Review.deleteMany({blog: blog._id}).catch(err=> console.log(err.message));
    return {status: true, data: result};
};

module.exports = {
    remove,
}