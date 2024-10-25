const mongoose = require('mongoose');
const Rounding = require('../models/rounding');
const RoundingMembers = require('../models/rounding_members');
const User = require('../models/user');
const { UserHidenField } = require('../constants/security')
const { RoundingRequestType } = require('../constants/type');

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
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};
// update the rounding
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const result = await Rounding.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};
// get roundings 
const gets = async (req, res) => {
    const { key, limit, skip, start_date, end_date } = req.query;
    const query = [{createdAt: new Date('2000-1-1')}];
    if (start_data) 
        query.push({opening_date: {$gte: start_date}});
    if (end_data) 
        query.push({opening_date: {$lte: end_date}})
    if (key)
        query.push({title: {$regex: `${key}.*`, $options:'i' }});
    const count = await Rounding.countDocuments({$and:query});
    const data = await Rounding.aggregate([
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

// remove a rounding
const remove = async (req, res) => {
    const { _id } = req.params;
    const result = await Rounding.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// removed the selected roundings
const removes = async (req, res) => {
    const { ids } = req.body;
    
    const result = await Rounding.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// get the detail of the Rounding.
const get = async (req, res) => {
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
            error: 'there is no rounding',
        })
    }
    
    const rounding_members = await RoundingMembers.find({rounding: _id})
            .populate({
                path: 'user',
                select: UserHidenField
            })
            .catch(err => console.log(err.message));
    const request_user = [];
    const request_owner = [];
    const allowed_users = [];
    console.log
    rounding_members.forEach(e => {
        if(e.enabled) {
            allowed_users.push(e);
        }else {
            switch (e.enter_type) {
                case RoundingRequestType.REQUEST:
                    request_user.push(e);
                    break;
                case RoundingRequestType.INVITE:
                    request_owner.push(e);
                    break;
            }
        }
        
    })
    return res.send({
        status: true,
        data: {
            rounding,
            request_owner,
            request_user,
            allowed_users,
        },
    })
};


// get the roundings that I created.
const get_mine = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const today = new Date();
    console.log(today);
    const roundings = await Rounding.find({user: currentUser._id, opening_date: {$gte: today}}).catch(err => console.log(err.message));
    return res.send({ status: true, data: roundings });
};

// get the roundings to proceed on the selected date.
const get_date = async (req, res) => {
    const { limit, skip, date } = req.query;
    const _date = new Date(date);
    const start_date = new Date(_date.setHours(0,0,0, 0));
    const end_date = new Date(_date.setHours(23,59,59, 999));
    const roundings = await Rounding.aggregate([
        {
            $match: {
                opening_date: {
                $gte: start_date,
                $lt: end_date,
            }},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip,
        },
    ]).catch(err => console.log(err.message));
    
    return res.send({status: true, data: roundings});
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
    const count = await Rounding.countDocuments(query);
    const roundings = await Rounding.aggregate([
        {
            $match: query,
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip
        },
        {
            $sort: {
                opening_date: -1,
            }
        },
    ]).catch(err => console.log(err.message));
    
    return res.send({status: true, data: 
        {
            count,
            roundings,
        }
    });
};

// get users who can gather.
const get_gather_users = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.params;
    const {limit, skip, sex, location, address, hit, start_age, end_age} = req.query;
    const members = await RoundingMembers.find({rounding:_id, 
        type: {$in:['allow_user', 'allow_owner']}}).catch(err => console.log(err.message));
    const rounding_users = members.map(e => e.user);
    
    rounding_users.push(currentUser._id);
    const query = [];
    if (rounding_users.length > 0) {
        query.push({_id: {$nin: rounding_users}});
    }
    if (location) {
        query.push({location});
    }
    let date;
    if (start_age) {
        date = new Date();
        date = new Date(date.setFullYear(date.getFullYear() - start_age));
        query.push({birthday: {$lte: new Date(date)}});
    }
    if (end_age) {
        date = new Date();
        date = new Date(date.setFullYear(date.getFullYear() - end_age));
        query.push({birthday: {$gte: new Date(date)}});
    }
    if (sex) {
        query.push({sex});
    }
    if (hit) {
        query.push({average_score: hit})
    }
    if (address) query.push({address: {$regex: `${address}.*`, $options:'i' }});
    const count = await User.countDocuments({$and: query});
    const users = await User.find({$and: query}, UserHidenField)
    .skip(skip)
    .limit(limit)
    .catch(err => {
        console.log(err.message);
    });
    return res.send({
        status: true,
        data: {
            count,
            users,
        }
    })  
};

// user request the rounding
const request_rounding = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const { _id: rounding_id } = req.body;
    const rounding = await Rounding.findOne({_id: rounding_id}).catch(err => console.log(err.message));
    if (!rounding) {
        return res.status(400).send({
            status: false,
            error: 'there is no such rounding.',
        })
    }
    if(rounding.user.toString() == currentUser._id.toString()) {
        return res.status(201).send({
            status: false,
            error: `you can't request on this rounding because you are the owner of this rounding.`,
        })
    }
    const _rounding_member = await RoundingMembers.findOne({user: currentUser._id, rounding: rounding_id}).catch(err => console.log(err.message));
    if (!_rounding_member) {
        const rounding_member = new RoundingMembers({
            user: currentUser._id,
            rounding: new mongoose.Types.ObjectId(rounding_id),
            type: RoundingRequestType.REQUEST,
        });
        const result = await rounding_member.save().catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
        return res.send({
            status: true,
            data: result,
        })
    }else {
        let error = ""
        console.log('=========', _rounding_member);
        
        if (_rounding_member.enabled) {
            error = 'You have already joined this rounding.';
        }
        else {
            switch(_rounding_member.request_type) {
            case RoundingRequestType.REQUEST:
                error = 'you did already request on this rounding';
                break;
            case RoundingRequestType.INVITE:
                error = 'the uer already was invited';
                break;
            }
        }
        return res.status(201).send({
            status: false,
            error
        })
    }
};

// invite a user on rounding (user should be owner or manager)
const invite_rounding = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Rounding
    const { _id: rounding_id, toUser } = req.body;
    const _rounding_member = await RoundingMembers.findOne({toUser, rounding: rounding_id}).catch(err => console.log(err.message));
    if (!_rounding_member) {
        const rounding_member = new RoundingMembers({
            user: currentUser._id,
            rounding: new mongoose.Types.ObjectId(rounding_id),
            request_type: RoundingRequestType.INVITE,
            toUser: new mongoose.Types.ObjectId(toUser),
        });
        const result = await rounding_member.save().catch(err => {
            return res.status(400).send({
                status: false,
                error: err.message,
            })
        });
        return res.send({
            status: true,
            data: result,
        })
    }else {
        let error = "";
        if (_rounding_member.enabled) {
            error = 'You have already joined this rounding.';
        } else {
            switch(_rounding_member.request_type) {
                case RoundingRequestType.REQUEST:
                    error = 'you did already request to the user on this rounding';
                    break;
                case RoundingRequestType.INVITE:
                    error = 'the uer already was invited';
                    break;
            }
        }
        
        return res.status(201).send({
            status: false,
            error
        })
    }
};

// get the roundings I request.
const request_list_roundings = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _roundings_members = await RoundingMembers.find({
            user: currentUser._id, 
            enabled: false,
            request_type: RoundingRequestType.REQUEST,    
        })
        .catch(err => console.log(err.message));
    const roundings_ids = _roundings_members.map((e)=>e.rounding);
    const count = await Rounding.countDocuments({_id: {$in: roundings_ids}})
    const _roundings = await Rounding.find({_id: {$in: roundings_ids}})
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .populate('club')
        .skip(skip)
        .limit(limit);
    const roundings = [];
    for(let i = 0; i < _roundings.length; i ++) {
        const r = _roundings[i];
        const count = await RoundingMembers.countDocuments({rounding: r._id, enabled: true});
        const rounding = {...r._doc}
        rounding.members_count = count;
        roundings.push(rounding);
    };
    return res.send({
        status: true,
        data: {
            count,
            roundings,
        }
    })
};

// get the roundings I was invited.
const invited_list_roundings = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _roundings_members = await RoundingMembers.find({
            toUser: currentUser._id, 
            enabled: false,
            request_type: RoundingRequestType.INVITE,
        })
        .catch(err => console.log(err.message));

    const roundings_ids = _roundings_members.map((e)=>e.rounding);
    const count = await Rounding.countDocuments({_id: {$in: roundings_ids}})
    const _roundings = await Rounding.find({_id: {$in: roundings_ids}})
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .populate('club')
        .skip(skip)
        .limit(limit);
    const roundings = [];
    
    for(let i = 0; i < _roundings.length; i ++) {
        const r = _roundings[i];
        const count = await RoundingMembers.countDocuments({rounding: r._id, enabled: true});
        const rounding = {...r._doc}
        rounding.members_count = count;
        roundings.push(rounding);
    };
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

// Remove participating users.
const remove_user = async(req, res) => {
    const { rounding, user} = req.body;
    const result = await RoundingMembers.deleteOne({user, rounding}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({
        status: true,
        data: result,
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
    get_date,
    get_recent,
    get_gather_users,
    request_list_roundings,
    invited_list_roundings,
    request_rounding,
    invite_rounding,
    allow_request,
    remove_user,
}