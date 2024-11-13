const moment = require('moment')
const mongoose = require('mongoose');
const Rounding = require('../models/rounding');
const RoundingMembers = require('../models/rounding_members');
const { UserHidenField } = require('../constants/security');
const { RequestType } = require('../constants/type');
const { 
    get_roundings: get_roundings_helper, 
    invite: invite_helper,
    request: request_helper
} = require('../helpers/rounding');
const { get_users:get_users_helper } = require('../helpers/user');
const { query } = require('express');

// create a rounding
const create = async(req, res) => {
    const {currentUser} = req;
    if (currentUser.role === 2) {
        req.body.user = currentUser._id;
    }
    const rounding = new Rounding({
        ... req.body,
    });
    
    const result = await rounding.save().catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    const rounding_member = new RoundingMembers({
        user: currentUser._id,
        rounding: rounding._id,
        request_type: RequestType.OWN,
        enabled: true,
    });

    await rounding_member.save();
    return res.send({ status: true, data: result });
};

// update the rounding
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const result = await Rounding.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    return res.send({ status: true, code: 200, data: result });
};

// get roundings 
const gets = async (req, res) => {
    const { key, limit, skip, start_date, end_date } = req.query;
    const query = {};
    
    if (start_date) 
        query.opening_date = {$gte: new Date(start_date)};
    if (end_date) 
        query.opening_date = {...query.opening_date, ...{$lte: new Date(end_date)}};
    if (key)
        query.title = {$regex: `${key}.*`, $options:'i' };
    
    const count = await Rounding.countDocuments(query);
    const roundings = await Rounding.find(query)
    .populate({
        path: 'user',
        select: UserHidenField
    })    
    .skip(skip)
    .limit(limit);

    return res.send({ status: true, code: 200, data: {count, roundings} });
};

// remove a rounding
const remove = async (req, res) => {
    const { _id } = req.params;
    const result = await Rounding.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

// removed the selected roundings
const removes = async (req, res) => {
    const { ids } = req.body;
    
    const result = await Rounding.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 200, data: result});
};

// get the detail of the Rounding.
const get = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const rounding = await Rounding.findOne({_id})
        .populate({
            path: 'user',
            select: UserHidenField
        })
    .catch(err => console.log(err.message));
    if(!rounding) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no rounding',
        })
    }
    const rounding_members = await RoundingMembers.find({rounding: _id})
            .populate({
                path: 'user',
                select: UserHidenField
            })
            .catch(err => console.log(err.message));
    const request_users = [];
    const invited_users = [];
    const allowed_users = [];
    rounding_members.forEach(e => {
        if(e.enabled) {
            allowed_users.push(e);
        }else {
            switch (e.request_type) {
                case RequestType.REQUEST:
                    request_users.push(e);
                    break;
                case RequestType.INVITE:
                    invited_users.push(e);
                    break;
            }
        }
        
    });
    let idx;
    let invited_id, requested_id;
    idx = request_users.findIndex(e => e.user._id.toString() === currentUser._id.toString());
    if(idx > -1) requested_id = request_users[idx]._id;
    idx = invited_users.findIndex(e => e.user._id.toString() === currentUser._id.toString());
    if(idx > -1) invited_id = invited_users[idx]._id;
    console.log(rounding.user.follow_rounding_ids, currentUser._id);
    const is_followed = currentUser.follow_rounding_ids.findIndex(e => e.toString() === rounding._id.toString()) > -1?true:false;
    return res.send({
        status: true,
        code: 200,
        data: {
            ...rounding._doc,
            member_count: allowed_users.length,
            request_count: request_users.length,
            invited_count: invited_users.length,
            requested_id,
            invited_id,
            is_followed
        },
    })
};

// get the roundings that I created.
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const today = new Date();
    const query = {user: currentUser._id, opening_date: {$gte: today}};
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

const get_range = async (req, res) => {
    const { start_date, days, sex, location, golf_experience, golf_hit } = req.body;
    let date1 = moment(start_date);
    const query = {};
    const result = [];
    if (sex) {
        query.sex_option = sex;
    }
    if (golf_hit) {
        query.golf_hit = {$in:golf_hit};
    }
    if (golf_experience) {
        query.golf_experience = {$in:golf_experience};
    }
    if (location) {
        query.location = location;
    }
    
    for(let i = 0; i < days; i ++) {
        date2 = date1.clone().add(1, 'days');
        query.opening_date = {
            $gte: date1.toDate(),
            $lt: date2.toDate()
        };
        const count = await Rounding.countDocuments(query);
        result.push({date: date1.format('YYYY-MM-DD'), count});
        date1 = date2;
    }
    
    return res.send({
        status: true, 
        code: 200,
        data: result
    });
}

// get the roundings to proceed on the selected date.
const get_date = async (req, res) => {
    const { limit, skip, date, sex, location, golf_experience, golf_hit } = req.query;
    const _date = new Date(date);
    const start_date = new Date(_date.setHours(0,0,0, 0));
    const end_date = new Date(_date.setHours(23,59,59, 999));
    const query = {
            opening_date: {
            $gte: start_date,
            $lt: end_date,
        }
    };
    if (sex) {
        query.sex_option = sex;
    }
    if (golf_hit) {
        query.golf_hit = {$in:golf_hit};
    }
    if (golf_experience) {
        query.golf_experience = {$in:golf_experience};
    }
    if (location) {
        query.location = location;
    }
    
    const {count, roundings} = await get_roundings_helper(query, limit, skip);
    return res.send({
        status: true, 
        code: 200,
        data: {
            count,
            roundings
        }
    });
};

// get roundings to proceed recently
const get_recent = async (req, res) => {
    const { limit, skip, } = req.query;
    const start_date = new Date();
    const query = {
        opening_date: {
            $gte: start_date,
        }
    };
    const {count, roundings} = await get_roundings_helper(query, limit, skip, -1);
    return res.send({
        status: true, 
        code: 200,
        data: {
            count,
            roundings,
        }
    });
};

// get users who can gather.
const get_available_users = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.params;
    const {limit, skip, key, sex, location, golf_experience, golf_hit, start_age, end_age} = req.query;
    const rounding = await Rounding.findOne({_id}).catch(err => console.log(err.message));
    if (!rounding) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no such rounding',
        });
    }
    const members = await RoundingMembers.find({rounding:_id}).catch(err => console.log(err.message));
    const rounding_users = members.map(e => {
        if(e.request_type == RequestType.INVITE)
            return e.toUser;
        else 
            return e.user;
    });
    const query = {};
    if (key) {
        query['$or'] = [{email: {$regex: `${key}.*`, $options:'i' }},
            {fullname: {$regex: `${key}.*`, $options:'i' }},
        ];
    }
    if (rounding_users.length > 0) {
        query._id = {$nin: rounding_users};
    }
    if (sex) {
        query.sex_option = sex;
    }
    if (golf_hit) {
        query.hit = {$in:golf_hit};
    }
    if (golf_experience) {
        query.experience = {$in:golf_experience};
    }
    if (location) {
        query.location = location;
    }
    if(start_age) {
        let age1 = moment().subtract(start_age, 'year');
        query.birthday = {$gte: age1.toDate()};
    }
    if(end_age) {
        let age2 = moment().subtract(end_age, 'year');
        query.birthday = {... query.birthday, ...{$lte: age2.toDate()}};
    }
    
    const {count, users} = await get_users_helper(query, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            users,
        }
    })  
};

// get users requested to this rounding 
const get_requested_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const query = {
        rounding: _id, 
            request_type: RequestType.REQUEST, 
            enabled: false
    }
    const count = await RoundingMembers.countDocuments(query);
    const requests = await RoundingMembers.find(query, 
        {
            _id: 1,
            user: 1
        })
        .populate({
            path: 'user',
            select: {
                _id: 1,
                fullname: 1,
                email: 1,
                logo: 1,
                experience_years: 1,
                average_score: 1,
                month_average_score: 1,
            }
        })
        .limit(limit)
        .skip(skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count, requests
        }
    })
}

// get users invited on this rounding 
const get_invited_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const query = {
        rounding: _id, 
            request_type: RequestType.INVITE, 
            enabled: false
    }
    const count = await RoundingMembers.countDocuments(query);
    const invites = await RoundingMembers.find(query, 
        {
            _id: 1,
            toUser: 1
        })
        .populate({
            path: 'toUser',
            select: {
                _id: 1,
                fullname: 1,
                email: 1,
                logo: 1,
                experience_years: 1,
                average_score: 1,
                month_average_score: 1,
            }
        })
        .limit(limit)
        .skip(skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count, invites
        }
    })
}

// get user on rounding
const get_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const members = await RoundingMembers.find({rounding: _id, enabled: true});
    
    const user_ids = members.map(e => {
        if(e.request_type == RequestType.INVITE)
            return e.toUser;
        else return e.user;
    });
    
    const query = {_id: {$in: user_ids}};
    const {count, users} = await get_users_helper(query, limit, skip);
    
    return res.send({
        status: true,
        code: 200,
        data: {
            count, users
        }
    })
}

const reject_request = async(req, res) => {
    const {_id} = req.params;
    const result = await RoundingMembers.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message
        });
    })
    return res.send({
        status: true,
        code: 200,
        data: result
    })
}

// user request the rounding
const request = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const { _id: rounding_id, fromUser } = req.body;
    
    const users = [];
    const result = await request_helper(rounding_id, fromUser);
    if(!result)
        return res.status(400).send({
            status: false,
            code: 400,
    });
    return res.send({
        status: true,
        code: 200,
    });
};

// invite a users on rounding (user should be owner or manager)
const invite_users = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Rounding
    const { _id: rounding_id, toUsers } = req.body;
    const users = [];
    for(let i = 0; i < toUsers.length; i ++) {
        const result = await invite_helper(rounding_id, currentUser._id, toUsers[i]);
        if(result) users.push(toUsers[i]);
    }
    return res.send({
        status: true,
        code: 200,
        data: users,
    });
};


// invite a user on rounding (user should be owner or manager)
const invite_user = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Rounding
    const { _id: rounding_id, toUser } = req.body;
    const users = [];
    const result = await invite_helper(rounding_id, currentUser._id, toUser);
    if(!result)
        return res.status(400).send({
            status: false,
            code: 400,
    });
    return res.send({
        status: true,
        code: 200,
    });
};
// get the roundings I request.
const request_list = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _roundings_members = await RoundingMembers.find({
            user: currentUser._id, 
            enabled: false,
            request_type: RequestType.REQUEST,    
        })
        .catch(err => console.log(err.message));
    const roundings_ids = _roundings_members.map((e)=>e.rounding);
    const query = {_id: {$in: roundings_ids}};
    const {count, roundings} = await get_roundings_helper(query, limit, skip);
    return res.send({
        status: true,
        data: {
            count,
            roundings,
        }
    })
};

// get the roundings I was invited.
const invited_list = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _roundings_members = await RoundingMembers.find({
            toUser: currentUser._id, 
            enabled: false,
            request_type: RequestType.INVITE,
        })
        .catch(err => console.log(err.message));

    const roundings_ids = _roundings_members.map((e)=>e.rounding);
    const query = {_id: {$in: roundings_ids}};
    const {count, roundings} = await get_roundings_helper(query, limit, skip);
    return res.send({
        status: true,
        data: {
            count,
            roundings,
        }
    })
};

// user allow the request from the owner or user.
const allow_request = async(req, res) => {
    const { currentUser } = req; 
    const { _id } = req.body;
    const rounding_member = await RoundingMembers.findOne({_id}).catch(err => console.log(err.message));
    if(!rounding_member) {
        return res.status(400).send({
            status: false,
            error: 'there is no such request.',
        })
    }

    const result = await RoundingMembers.updateOne({_id}, {$set: { enabled: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        data: result,
    })
};

const remove_user = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Rounding
    const { _id: rounding_id } = req.params;
    const { user } = req.body;
    const query = {
        rounding: rounding_id,
        $or: [
            { user },
            { toUser: user}
        ],
        enabled: true
    }
    const result = await RoundingMembers.deleteOne(query).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        code: 200,
        data: result
    })
};

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    get_mine,
    get_range,
    get_users,
    get_date,
    get_recent,
    get_available_users,
    get_requested_users,
    get_invited_users,

    request_list,
    invited_list,
    request,
    invite_users,
    invite_user,
    allow_request,
    reject_request,
    remove_user,
}