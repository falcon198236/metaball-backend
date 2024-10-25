const mongoose = require('mongoose');
const { FollowType, SettingsType } = require('../constants/type');
const User = require('../models/user');
const Rounding = require('../models/rounding');
const Blog = require('../models/blog');

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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        data: result,
    });
};
// get the users I followed.
const get_mine_users = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query; // id : user or club 'id
    const count = await User.countDocuments({_id: {$in: currentUser.follow_user_ids}});
    const users = await User.find({_id: {$in: currentUser.follow_user_ids}}, {
        hash: 0, salt: 0, role: 0, follow_user_ids: 0, deleted: 0,
    })
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
        data: {
            count,
            users,
        }
    });
};
// get the users who followed me.
const get_yours_users = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const count = await User.countDocuments({follow_user_ids: currentUser._id});
    const users = await User.find({follow_user_ids: currentUser._id},  {
        hash: 0, salt: 0, role: 0, follow_user_ids: 0, deleted: 0,
    })
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
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
        return res.status(201).send({
            status: false,
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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        data: result,
    });
};
// cancel the follow _id rounding.
const cancel_rounding = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const a = currentUser.follow_rounding_ids.findIndex(e => e.toString() === _id);
    if (a < 0) {
        return res.status(201).send({
            status: false,
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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        data: result,
    });
};
// get the roundings I followed.
const get_mine_roundings = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query; // id : user or club 'id
    const count = await Rounding.countDocuments({_id: {$in: currentUser.follow_rounding_ids}});
    const roundings = await Rounding.find({_id: {$in: currentUser.follow_rounding_ids}})
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
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
        return res.status(201).send({
            status: false,
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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        data: result,
    });
};
// cancel the follow _id blog.
const cancel_blog = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const a = currentUser.follow_blog_ids.findIndex(e => e.toString() === _id);
    if (a < 0) {
        return res.status(201).send({
            status: false,
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
            error: err.message,
        })
    });
    
    return res.send({
        status: true,
        data: result,
    });
};
// get the roundings I followed.
const get_mine_blogs = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query; // id : user or club 'id
    const count = await Blog.countDocuments({_id: {$in: currentUser.follow_blog_ids}});
    const blogs = await Blog.find({_id: {$in: currentUser.follow_blog_ids}})
            .limit(limit)
            .skip(skip)
            .catch(err=>console.log(err.message));
    
    return res.send({
        status: true,
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
    get_mine_users,
    get_yours_users,

    set_rounding,
    cancel_rounding, 
    get_mine_roundings,

    set_blog,
    cancel_blog, 
    get_mine_blogs,
}