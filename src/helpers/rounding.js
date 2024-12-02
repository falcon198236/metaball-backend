const mongoose = require('mongoose');
const Rounding = require('../models/rounding');
const RoundingMembers   = require('../models/rounding_members');
const { UserHidenField } = require('../constants/security');
const { RequestType } = require('../constants/type');

const get_roundings = async (query, limit = 10, skip = 0, sort = 1) =>{
    const count = await Rounding.countDocuments(query);
    const _roundings = await Rounding.find(query)
        .populate({
            path: 'user',
            select: UserHidenField,
        })
        .populate('club')
        .populate('golfcourse')
        .sort({created_at: sort})
        .limit(limit)
        .skip(skip)
    .catch(err => console.log(err.message));
    
    const roundings = [];
    for(let i = 0; i < _roundings.length; i ++) {
        const r = _roundings[i];
        const count = await RoundingMembers.countDocuments({rounding: r._id, enabled: true});
        const rounding = {... r._doc, member_count: count};
        roundings.push(rounding);
    }
    return {count, roundings};
}

const invite = async(rounding_id, user, toUser) =>{
    const _rounding_member = await RoundingMembers.findOne({
        rounding: rounding_id,
        $or: [
            {toUser},
            {user: toUser} 
        ]
    }).catch(err => console.log(err.message));
    if (!_rounding_member) {
        const rounding_member = new RoundingMembers({
            user,
            rounding: new mongoose.Types.ObjectId(rounding_id),
            request_type: RequestType.INVITE,
            toUser: new mongoose.Types.ObjectId(toUser),
        });
        await rounding_member.save().catch(err => {
            return false;
        });
        return true;
    } else {
        return false;
    }
}

const request = async(rounding_id, fromUser) =>{
    const _rounding_member = await RoundingMembers.findOne({
        rounding: rounding_id,
        $or: [
            {toUser: fromUser},
            {user: fromUser} 
        ]
    }).catch(err => console.log(err.message));
    if (!_rounding_member) {
        const rounding_member = new RoundingMembers({
            user: fromUser,
            rounding: new mongoose.Types.ObjectId(rounding_id),
            request_type: RequestType.REQUEST,
        });
        await rounding_member.save().catch(err => {
            return false;
        });
        return true;
    } else {
        return false;
    }
}
module.exports = {
    get_roundings,
    invite,
    request,
}