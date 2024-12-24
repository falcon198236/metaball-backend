const Message = require('../models/message');
const ClubMembers = require('../models/club_members');
const User = require('../models/user');
const Club = require('../models/club');

const { 
    get_dm_message: get_dm_message_helper, 
    get_club_message:get_club_message_helper 
} = require('../helpers/message');
const {get_club_members: get_club_members_helper} = require('../helpers/club');
const { MessageType, RequestType, MessageResponseStatus } = require('../constants/type');
const Rounding = require('../models/rounding');
const SECTION = 'message';

const send_dm = async(req, res) => {
    const {currentUser} = req;
    const { _id: _to_user } = req.params;
    const to_user = await User.findOne({_id: _to_user}, {_id: 1, logo: 1});
    
    if (to_user.block_user_ids?.findIndex(e => e.toString() === currentUser._id.toString()) > -1) {
        return res.status(205).send({
            status: false,
            code: 205,
            error: 'you was blocked by this user',
        });
    }
    const { msg, type } = req.body;
    const _files = req.files?.map(f => f.path);
    const message = new Message({
        from_user: currentUser._id,
        file: _files?.length? _files[0] : '',
        to_user: _to_user,
        msg,
        type,
    });

    const result = await message.save().catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    const from_user = {
        _id: currentUser._id,
        logo: currentUser.logo,
    }
    const data = {...result._doc};
    data.from_user = from_user;
    data.to_user = to_user;
    return res.send({
        status: true, 
        code: 200, 
        data
    });
};

const send_club = async(req, res) => {
    const {currentUser} = req;
    const { _id: club_id } = req.params;
    const { msg, type, to_user, rounding } = req.body;
    const _files = req.files?.map(f => f.path);
    let club_member;
    let response_status = MessageResponseStatus.NONE;
    switch(type) {
    case MessageType.REQUEST:
        // in case that user send the request to CLUB
        // create a request on ClubMembers
        club_member = new ClubMembers({
            user: currentUser._id,
            club: club_id,
            request_type: RequestType.REQUEST,
            enabled: false,
        });
        response_status = MessageResponseStatus.PENDING;
        break;
    case MessageType.INVITE:
        // in case that manager send the invite to any user
        // create a invite  on ClubMembers
        club_member = new ClubMembers({
            user: to_user,
            club: club_id,
            request_type: RequestType.INVITE,
            enabled: false,
        });
        response_status = MessageResponseStatus.PENDING;
        break;
    }
    if(club_member) {
        await club_member.save();
    }
    const message = new Message({
        from_user: currentUser._id,
        file: _files?.length? _files[0] : '',
        club: club_id,
        to_user,
        msg,
        type,
        rounding,
        response_status,
        request_id: club_member?._id,
        status: true,
    });

    const result = await message.save().catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        })
    });

    const data = {...result._doc};
    data.from_user = {
        _id: currentUser._id,
        logo: currentUser.logo,
    };
    if(to_user) {
        const _to_user = await User.findOne({_id: to_user});
        data.to_user = {
            _id: to_user,
            logo: _to_user?.logo
        }
    }
    if (rounding) {
        const _rounding = await Rounding.findOne({_id: rounding});
        data.rounding = _rounding;
    }

    return res.send({status: true, code: 200, data});
};

const get_dm_message_for_user = async(req, res) => {
    const {currentUser} = req;
    const {skip, limit} = req.query;
    const {_id: user_id} = req. params;
    const query = {
        club: {$exists: false},
        $or: [
            {to_user: user_id},
            {from_user: user_id},
        ]
    };
    const count = await Message.countDocuments(query)
    const messages = await Message.find(query)
        .populate({
            path: 'from_user',
            select: {
                logo: 1,
                fullname: 1,
                email: 1
            }
        })
        .populate({
            path: 'to_user',
            select: {
                logo: 1,
                fullname: 1,
                email: 1
            }
        })
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip);
       
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            messages
        },
    })    
}
const get_dm_unread_message = async(req, res) => {
    const {currentUser} = req;
    const {skip, limit} = req.query;
    const {_id: user_id} = req. params;
    const query = {
        club: {$exists: false},
        // status: false,
        $or: [{
                $and: [
                    {from_user: currentUser._id},
                    {to_user: user_id},
                ]
            },{
                $and: [
                    {to_user: currentUser._id},
                    {from_user: user_id},
                ]
            }
        ]
    };

    const {count, messages} = await get_dm_message_helper(query, currentUser._id, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            messages
        },
    });
}

const get_club_unread_message = async(req, res) => {
    const { currentUser } = req;
    const {skip, limit} = req.query;
    const {_id: club_id} = req. params;
    const query = {
        club: club_id,
        status: false,
    };

    const {count, messages} = await get_club_message_helper(query, currentUser._id, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            messages,
        }
    });
}

const get_dm_message = async(req, res) => {
    const {currentUser} = req;
    const {skip, limit} = req.query;
    const {_id: user_id} = req. params;
    const query = {
        club: {$exists: false},
        $or: [{
                $and: [
                    {from_user: currentUser._id},
                    {to_user: user_id},
                ]
            },{
                $and: [
                    {to_user: currentUser._id},
                    {from_user: user_id},
                ]
            }
        ]
    };

    const {count, messages} = await get_dm_message_helper(query, currentUser._id, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            messages
        },
    })    
}
// get messages on this club
const get_club_message = async(req, res) => {
    const { currentUser } = req;
    const {skip, limit} = req.query;
    const {_id: club_id} = req. params;
    const query = {
        club: club_id,
    };
    const members = await get_club_members_helper(club_id);
    
    if(members.findIndex(e => e.toString() === currentUser._id.toString()) === -1) {
        // show only self message for non member
        query["$or"] = [{from_user: currentUser._id}, {to_user: currentUser._id}];
    }
    
    const {count, messages} = await get_club_message_helper(query, limit, skip);
    return res.send({
        status: true,
        code: 200,
        data: {
            count,
            messages,
        }
    });
}

// get available clubs
const get_clubs = async(req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const query = {
        club: {$exists: true},
        $or: [
                {from_user: currentUser._id}, 
                {to_user: currentUser._id}
            ]
    };
    const messages = await Message.aggregate([
        {
            $match: query,
        },
        {
            $sort: { updated_at: -1}
        },
        {
            $group: {                               // Group back by user
                _id: {
                    club: "$club",
                },
                msg: {$first: "$msg"},
                date: {$first: "$updated_at"},
            }
        },
        {
            $sort: { date: -1}
        },
    ]);
    const clubs = [];
    for (let i = skip; i < skip + limit; i ++) {
        if(i >= messages.length) continue;
        const message = messages[i];
        const club = {};
        const _club = await Club.findOne({_id: message._id.club}, {_id: 1, name: 1, logo: 1});
        if(_club) {
            club.info = _club;
            club.message = message.msg;
            club.last_date = message.date;
            clubs.push(club);
        }
    }

    return res.send({
        status: true,
        code: 200,
        data: clubs
    });
}

const get_users = async(req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const query = {
        club: {$exists: false},
        $or: [
            {from_user: currentUser._id},
            {to_user: currentUser._id},
        ]
    };
    const messages = await Message.aggregate([
        {
            $match: query,
        },
        {
            $sort: { created_at: -1}
        },
        {
            $group: {                               // Group back by user
                _id: {
                    from_user: "$from_user",
                    to_user: "$to_user",
                },
                msg: {$first: "$msg"},
                date: {$first: "$created_at"},
            }
        },
        {
            $sort: { date: -1}
        },
        
    ]);

    const users = [];
    for (let i = 0; i < messages.length; i ++) {
        const message = messages[i];
        const user = {};
        if (message._id.from_user.toString() === currentUser._id.toString()) {
            user.id = message._id.to_user;
            user.direction = 'send';
        }else if(message._id.to_user.toString() === currentUser._id.toString()) {
            user.id = message._id.from_user;
            user.direction = 'receive';
        }

        if (currentUser.block_user_ids?.findIndex(e => e.toString() === user.id.toString()) > -1) continue;
        if(user.id && !users.some((e) => e.info._id.toString() === user.id.toString())) {
            const _user = await User.findOne({_id: user.id}, {_id: 1, email: 1, logo: 1, fullname: 1});
            if(_user) {
                user.info = _user;
                user.message = message.msg;
                user.last_date = message.date;
                delete user.id;
                users.push(user);
            }
        }
    }

    return res.send({
        status: true,
        code: 200,
        data: users
    });
}

const remove = async( req, res) => {
    const {_id} = req.params;
    const result = await Message.deleteOne({_id}).catch(err =>{
        return res.statu(400).send({
            status: false,
            code: 400,
            data: 'can`t remove message',
        });
    })
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
}

// check if there are any unread messages.
const has_unread_message = async(req, res) => {
    const {currentUser} = req;
    const result = await Message.countDocuments({to_user: currentUser._id, status: false});
    return res.send({
        status: true,
        code: 200,
        data: result,
    })
}

module.exports = {
    // addmin
    get_dm_message_for_user,

    // client
    get_users,
    get_clubs,
    send_dm,
    send_club,
    get_dm_message,
    get_dm_unread_message,
    get_club_message,
    get_club_unread_message,
    has_unread_message,
    remove,
}