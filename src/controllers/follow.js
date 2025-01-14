const mongoose = require('mongoose');
const { FollowType, SettingsType } = require('../constants/type');
const User = require('../models/user');
const Rounding = require('../models/rounding');
const Blog = require('../models/blog');
const { get_users } = require('../helpers/user');
const { get_roundings: get_roundings_helper } = require('../helpers/rounding');
const { UserHidenField } = require('../constants/security');

// follow the _id user
const set_user = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.body;
    const a = currentUser.follow_user_ids.findIndex(e => e.toString() === _id);
    if (a >= 0) {
        return res.status(201).send({
            status: false,
            error: 'you aleady followd him',
        })    
    }
    const follow_user_ids = currentUser.follow_user_ids;
    follow_user_ids.push(new mongoose.Types.ObjectId(_id));
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_user_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
};
// cancel the follow _id user.
const cancel_user = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const a = currentUser.follow_user_ids.findIndex(e => e.toString() === _id);
    if (a < 0) {
        return res.status(201).send({
            status: false,
            error: 'you do not follow the user',
        })    
    }
    const follow_user_ids = currentUser.follow_user_ids;
    follow_user_ids.splice(a, 1);
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_user_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
};
// get the users I followed.
const get_user_to_users = async (req, res) => {
    const { limit, skip } = req.query; // id : user or club 'id
    const { _id } = req.params;

    const user = await User.findOne({_id}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message
        })
    });

    if(!user.follow_user_ids.length) {
        return res.send({
            status: true,
            code: 200,
            data: {
                count: 0,
                users: [],
            }
        });
    }

    const query = {_id: {$in: user.follow_user_ids}, deleted: false};
    const {count, users} = await get_users(query, limit, skip);
    
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            users,
        }
    });
};

// get the users who followed me.
const get_user_from_users = async (req, res) => {
    const { limit, skip } = req.query; // id : user or club 'id
    const { _id } = req.params;

    const query = {follow_user_ids: _id, deleted: false};
    const {count, users} = await get_users(query, limit, skip);

    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            users,
        }
    });
};



// follow the _id rounding
const set_rounding = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.body;
    const a = currentUser.follow_rounding_ids.findIndex(e => e.toString() === _id);
    if (a >= 0) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'you aleady followd rounding',
        })    
    }
    const follow_rounding_ids = currentUser.follow_rounding_ids;
    follow_rounding_ids.push(new mongoose.Types.ObjectId(_id));
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_rounding_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
};
// cancel the follow _id rounding.
const cancel_rounding = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const a = currentUser.follow_rounding_ids.findIndex(e => e.toString() === _id);
    if (a < 0) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'you do not follow the rounding',
        })    
    }
    const follow_rounding_ids = currentUser.follow_rounding_ids;
    follow_rounding_ids.splice(a, 1);
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_rounding_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 400,
        data: result,
    });
};
// get the roundings I followed.
const get_roundings = async (req, res) => {
    const { _id } = req.params;
    const { limit, skip } = req.query; // id : user or club 'id
    const user = await User.findOne({_id});
    if (!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no such user',
        });
    }
    const query = {_id: {$in: user.follow_rounding_ids}, deleted: false};
    const {count, roundings} = await get_roundings_helper(query, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            roundings,
        }
    });
};

// follow the _id blog
const set_blog = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.body;
    const a = currentUser.follow_blog_ids.findIndex(e => e.toString() === _id);
    
    if (a >= 0) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'you aleady followd him',
        })    
    }
    const follow_blog_ids = currentUser.follow_blog_ids;
    follow_blog_ids.push(new mongoose.Types.ObjectId(_id));
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_blog_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
};
// cancel the follow _id blog.
const cancel_blog = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const a = currentUser.follow_blog_ids.findIndex(e => e.toString() === _id);
    if (a < 0) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'you do not follow the user',
        })    
    }
    const follow_blog_ids = currentUser.follow_blog_ids;
    follow_blog_ids.splice(a, 1);
    result = await User.updateOne({_id: currentUser._id}, {
        $set: {
            follow_blog_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
};
// get the roundings I followed.
const get_blogs = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const { limit, skip } = req.query; // id : user or club 'id
    const user = await User.findOne({_id});
    if (!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no such user',
        });
    }
    const query = {_id: {$in: user.follow_blog_ids}, deleted: false };
    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
            .populate({
                path: 'user',
                select: UserHidenField,
            })
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            blogs,
        }
    });
};
module.exports = {
    // api for Admin
    // api for Client
    set_user,
    cancel_user, 
    get_user_to_users,
    get_user_from_users,
 
    set_rounding,
    cancel_rounding, 
    get_roundings,

    set_blog,
    cancel_blog, 
    get_blogs,
}