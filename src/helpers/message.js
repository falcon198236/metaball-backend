const moment = require('moment');

const Message = require('../models/message');
const Rounding = require('../models/rounding');

const get_dm_message = async(query, user, limit=10, skip = 0) => {
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
            }
        })
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip);
    const msg_ids = [];
    messages.forEach(e => {
        if(!e.status && e.to_user.toString() === user.toString()) {
            e.status = true;
            msg_ids.push(e._id);
        }
    });
    
    await Message.updateMany({_id: {$in: msg_ids}}, {$set: {status: true}});
    return {count, messages};
}
// get messages on this club
const get_club_message = async(query, limit=10, skip = 0) => {
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
        .populate({
            path: 'rounding',
            select: {
                _id: 1,
                title: 1,
                opening_date: 1,
            }
        })
        .sort({created_at: -1})
        .limit(limit)
        .skip(skip);
    return {count, messages};
}



module.exports = {
    get_dm_message,
    get_club_message,
}