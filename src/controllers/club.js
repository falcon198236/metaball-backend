const moment = require('moment');
const { mongoose } = require('mongoose');
const fs = require('fs');
const Club = require('../models/club');
const ClubMembers = require('../models/club_members');
const { UserHidenField } = require('../constants/security');
const { RequestType, MessageResponseStatus } = require('../constants/type');
const { get_clubs: get_clubs_helper, invite: invite_helper, request: request_helper } = require('../helpers/club');
const User = require('../models/user');
const { get_users:get_users_helper } = require('../helpers/user');
const Message = require('../models/message');
const { query } = require('express');

const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const _club = await Club.findOne({name: req.body.name});
    if (_club) {
        return res.status(203).send({
            status: false,
            code: 203,
            error: 'there is already such club',
        });
    }
    if (currentUser.role == 2) {
        req.body.user = currentUser._id;
    } else {
        if (!req.body.user) {
            return res.status(400).send({
                status: false,
                code: 400,
                error: 'not selected owner',    
            })
        }
        req.body.user = new mongoose.Types.ObjectId(req.body.user);
    }
    req.body.member_ids = [req.body.user]; // add owner as a member
    if(_files?.length) req.body.logo = _files[0];

    const club = new Club({...req.body});
    const result = await club.save().catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });

    const club_member = new ClubMembers({
        user: currentUser._id,
        club: club._id,
        request_type: RequestType.OWN,
        enabled: true,
    });

    await club_member.save();
    return res.send({ status: true, code: 200, data: result });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const _files = req.files?.map(f => f.path);
    const club = await Club.findOne({_id}).catch(err=> console.log(err.message));
    if (currentUser.role === 2 && club.user.toString() !== currentUser._id.toString()) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: `you can't update because you are not the owner of this club.`,
        })
    }
    if (_files?.length) {
        if (club.logo) {
            try {
                setTimeout(() => {
                    fs.unlinkSync(club.logo);
                }, 2000);
            }catch(err) {
                console.log(err.message);
            }
        }
        req.body['logo'] = _files[0];
    }
    const result = await Club.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(203).send({
            status: false,
            code: 203,
            error: err.message,
        })
    });
    return res.send({status: true, code: 400, data: result});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = {deleted: false};
    if (key)
        query.name = {$regex: `${key}.*`, $options:'i' };
    const count = await Club.countDocuments(query);
    const _clubs = await Club.find(query, {member_ids: 0, request_member_ids: 0, event_ids: 0, __v: 0})
        .populate({
            path: 'user',
            select: {
                fullname: 1,
                email: 1,
                logo: 1,
            }
        })
        .limit(limit)
        .skip(skip);
    const clubs = [];
    for(let i = 0; i < _clubs.length; i ++) {
        const r = _clubs[i];
        const count = await ClubMembers.countDocuments({club: r._id, enabled: true});
        const club = {...r._doc}
        club.member_count = count;
        clubs.push(club);
    };
    return res.send({
        status: true,
        data: {
            count,
            clubs,
        }
    });
};

const remove = async (req, res) => {
    const { _id } = req.params;
    // const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    // if (!club) {
    //     return res.status(400).send({
    //         status: false,
    //         code: 400,
    //         error: 'there is no club',
    //     });
    // }

    // if (club['logo']) {
    //     if(fs.existsSync(club['logo'])) {
    //         fs.unlinkSync(club['logo']);    
    //     }
    // }
    const result = await Club.updateOne({_id}, {$set: {deleted: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, code: 400, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    
    // const clubs = await Club.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    // clubs.forEach(u => {
    //     if (u['logo']) {
    //         if(fs.existsSync(u['logo'])) {
    //             fs.unlinkSync(u['logo']);    
    //         }
    //     }   
    // });

    const result = await Club.updateMany({_id: {$in: ids}}, {$set: {deleted: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });

    // ClubMembers.deleteMany({club: {$in: ids}}).catch(err => console.log(err));
    
    return res.send({status: true, code: 200, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const club = await Club.findOne({_id, deleted: false},
            {
                request_member_ids: 0,
                event_ids: 0
            }
        )
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .populate('location')
        .catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no club',
        })
    }

    const club_members = await ClubMembers.find({club: _id})
            .populate({
                path: 'user',
                select: UserHidenField
            })
            .catch(err => console.log(err.message));
    const request_users = [];
    const invited_users = [];
    const allowed_users = [];
    club_members.forEach(e => {
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

    return res.send({
        status: true,
        code: 200,
        data: {
            ...club._doc,
            member_count: allowed_users.length,
            request_count: request_users.length,
            invited_count: invited_users.length,
        },
    })
};


const get_mine = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const query = {user: currentUser._id, deleted: false,};
    const {count, clubs} = await get_clubs_helper(query, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            clubs,
        }
    });
};


// get get users who can gather for CLUB.
const get_available_users = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.params;
    const {limit, skip, name, sex, address, location, start_hit, end_hit, start_age, end_age} = req.query;
    const club = await Club.find({_id});
    if (!club) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no such club',
        });
    }
    const members = await ClubMembers.find({club:_id}).catch(err => console.log(err.message));
    const club_users = members.map(e => e.user);
    
    const query = {role: 2, deleted: false};
    if (club_users.length > 0) {
        query._id = {$nin: club_users};
    }
    if (name) {
        query['$or'] = [{email: {$regex: `${name}.*`, $options:'i' }},
            {fullname: {$regex: `${name}.*`, $options:'i' }},
        ];
    }
    if (address) {
        if(query['$or'])
            query['$or'].push({address: {$regex: `${address}.*`, $options:'i' }});
        else
            query['$or']= [{address: {$regex: `${address}.*`, $options:'i' }}];
    }
    if (sex && sex !== 'both') {
        query.sex = sex;
    }
    
    if (start_age) {
        let age1 = moment().subtract(start_age, 'year');
        age1.set({ month: 11, date: 31, hour:23, minutes:59 });
        query.birthday = {$lte: age1.toDate()};
    }
    if (end_age) {
        let age2 = moment().subtract(end_age, 'year');
        age2.set({ month: 0, date: 1, hour:0, minutes:0 });
        query.birthday = {...query.birthday, ...{$gte: age2.toDate()}};
    }
    if (location) {
        query.location = location;
    }
    
    if (start_hit) query.hit = {$gte: start_hit};
    if (end_hit) query.hit = {...query.hit, ...{$lte: end_hit}};
    const {count, users} = await get_users_helper(query, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            users,
        }
    });
};

// get users requested to this club 
const get_requested_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const query = {
        club: _id, 
        request_type: RequestType.REQUEST, 
        enabled: false
    }
    const count = await ClubMembers.countDocuments(query);
    const requests = await ClubMembers.find(query, 
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

// get users invited on this club 
const get_invited_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const query = {
        club: _id, 
        request_type: RequestType.INVITE, 
        enabled: false
    }
    const count = await ClubMembers.countDocuments(query);
    const invites = await ClubMembers.find(query, 
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
            count, invites
        }
    })
}
// get managers on club
const get_managers = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const club = await Club.findOne({_id, deleted: false});
    if(!club) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no such club'
        });
    }
    const user_ids = club.manager_ids;
    const query = {_id: {$in: user_ids}};
    const {count, users} = await get_users_helper(query, limit, skip);
    
    return res.send({
        status: true,
        code: 200,
        data: {
            count, users
        }
    });
}


// get user on club
const get_users = async (req, res) => {
    const { limit, skip } = req.query;
    const { _id } = req.params;
    const members = await ClubMembers.find({club: _id, enabled: true});
    
    const user_ids = members.map(e => e.user);
    
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
    const result = await ClubMembers.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message
        });
    });

    // update the responsive status of request message to REJECTED.
    await Message.updateOne({request_id: _id}, {$set: {response_status: MessageResponseStatus.REJECTED}});

    return res.send({
        status: true,
        code: 200,
        data: result
    })
}

// user request
const request = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const { _id: club_id, fromUser } = req.body;
    
    const users = [];
    const result = await request_helper(club_id, fromUser);
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

// invite a users on club (user should be owner or manager)
const invite_users = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of club
    const { _id: club_id, toUsers } = req.body;
    const users = [];
    for(let i = 0; i < toUsers.length; i ++) {
        const result = await invite_helper(club_id, currentUser._id, toUsers[i]);
        if(result) users.push(toUsers[i]);
    }
    return res.send({
        status: true,
        code: 200,
        data: users,
    });
};


// invite a user on club (user should be owner or manager)
const invite_user = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Club
    const { _id: club_id, toUser } = req.body;
    const users = [];
    const result = await invite_helper(club_id, currentUser._id, toUser);
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
// get the clubs I request.
const request_list = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _club_members = await ClubMembers.find({
            user: currentUser._id, 
            enabled: false,
            request_type: RequestType.REQUEST,    
        })
        .catch(err => console.log(err.message));
    const club_ids = _club_members.map((e)=>e.club);
    const count = await Club.countDocuments({_id: {$in: club_ids}})
    const _clubs = await Club.find({_id: {$in: club_ids}})
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .populate('club')
        .skip(skip)
        .limit(limit);
    const clubs = [];
    for(let i = 0; i < _clubs.length; i ++) {
        const r = _clubs[i];
        const count = await ClubMembers.countDocuments({club: r._id, enabled: true});
        const club = {...r._doc}
        club.member_count = count;
        clubs.push(club);
    };
    return res.send({
        status: true,
        data: {
            count,
            clubs,
        }
    });
};

// get the clubs I was invited.
const invited_list = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.query;
    const _club_members = await ClubMembers.find({
            user: currentUser._id, 
            enabled: false,
            request_type: RequestType.INVITE,
        })
        .catch(err => console.log(err.message));

    const club_ids = _club_members.map((e)=>e.club);
    const count = await Club.countDocuments({_id: {$in: club_ids}})
    const _clubs = await Club.find({_id: {$in: club_ids}})
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .populate('club')
        .skip(skip)
        .limit(limit);
    const clubs = [];
    
    for(let i = 0; i < _clubs.length; i ++) {
        const c = _clubs[i];
        const count = await ClubMembers.countDocuments({club: c._id, enabled: true});
        const club = {...r._doc}
        club.member_count = count;
        clubs.push(club);
    };
    return res.send({
        status: true,
        data: {
            count,
            clubs,
        }
    })
};

// user allow the request from the owner or user.
const allow_request = async(req, res) => {
    const { currentUser } = req; 
    const { _id } = req.body;
    const club_member = await ClubMembers.findOne({_id}).catch(err => console.log(err.message));
    if(!club_member) {
        return res.status(400).send({
            status: false,
            error: 'there is no such request.',
        })
    }

    const result = await ClubMembers.updateOne({_id}, {$set: { enabled: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    // update the responsive status of request message to ACCEPTED.
    await Message.updateOne({request_id: _id}, {$set: {response_status: MessageResponseStatus.ACCEPTED}});
    
    return res.send({
        status: true,
        data: result,
    })
};

// clubs I can enter
const get_available_clubs = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const {limit, skip} = req.body;
    const _club_members = await ClubMembers.find({
            user: currentUser._id, 
        })
        .catch(err => console.log(err.message));

    const club_ids = _club_members.map((e)=>e.club);
    const query = {_id: {$nin: club_ids}, deleted: false};
    const {count, clubs} = await get_clubs_helper(query, limit, skip);

    return res.send({
        status: true,
        data: {
            count,
            clubs,
        }
    });
}

// clubs I am as member
const get_joined = async(req, res) => {
    const { currentUser } = req; // currentUser is a general user
    const { _id } = req.params;
    const {limit, skip} = req.query;
    const _club_members = await ClubMembers.find({
            user: _id, 
            enabled: true,
        })
        .catch(err => console.log(err.message));

    const club_ids = _club_members.map((e)=>e.club);
    const query = {_id: {$in: club_ids}, deleted: false};
    const {count, clubs} = await get_clubs_helper(query, limit, skip);

    return res.send({
        status: true,
        data: {
            count,
            clubs,
        }
    });
}

// add member directly for testing
const add_member = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Club
    const { _id: club_id } = req.params;
    const { user } = req.body;
    const club_member = new ClubMembers({
        user,
        club: club_id,
        request_type: RequestType.REQUEST,
        enabled: true,
    });

    const result = await club_member.save();

    return res.send({
        status: true,
        code: 200,
        data: result
    })
}

// remove member directly for testing
const remove_member = async(req, res) => {
    const { currentUser } = req; // currentUser is the owner of Club
    const { _id: club_id } = req.params;
    const { user } = req.body;
    const query = {
        club: club_id,
        user,
        enabled: true
    }
    const result = await ClubMembers.deleteOne(query).catch(err => {
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
    });
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    // functions for Client
    get_mine,         // My clubs
    get_available_clubs,
    get_joined,
    get_managers,

    get_users,
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
    add_member,
    remove_member,
}