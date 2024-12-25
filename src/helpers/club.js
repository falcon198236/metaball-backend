const mongoose = require('mongoose');
const Club = require('../models/club');
const ClubMembers = require('../models/club_members');
const { UserHidenField } = require('../constants/security');
const { RequestType } = require('../constants/type');

const remove_fields = (club) => {
    delete club.user.hash;
    delete club.user.follow_user_ids;
    delete club.user.follow_blog_ids;
    delete club.user.follow_rounding_ids;
    delete club.user.role;
    delete club.user.themes;
    delete club.user.__v;
    delete club.user.accesses;
    delete club.location?.__v;
    delete club.__v;
    delete club.manager_ids;
    delete club.request_member_ids;
    delete club.event_ids;
    club.member_count = club.member_ids?.length || 0;
    delete club.member_ids;
    return club;
};


const get_clubs = async (query, limit = 0, skip = 0) => {
    const count  = await Club.countDocuments(query);
    const _clubs = await Club.find(query)
        .populate({
            path: 'user',
            select: UserHidenField
        })
        .limit(limit)
        .skip(skip);
    
    const clubs = [];
    for(let i = 0; i < _clubs.length; i ++) {
        const r = _clubs[i];
        const count = await ClubMembers.countDocuments({club: r._id, enabled: true});
        const club = {... r._doc, member_count: count};
        clubs.push(club);
    }
    return { count, clubs};
}

const invite = async(club_id, toUser) =>{
    const _club_member = await ClubMembers.findOne({
        club: club_id,
        user: toUser,
    }).catch(err => console.log(err.message));
    if (!_club_member) {
        const club_member = new ClubMembers({
            user: toUser,
            club: new mongoose.Types.ObjectId(club_id),
            request_type: RequestType.INVITE,
        });
        await club_member.save().catch(err => {
            return false;
        });
        return true;
    } else {
        return false;
    }
}

const request = async(club_id, fromUser) =>{
    const _club_member = await ClubMembers.findOne({
        club: club_id,
        user: fromUser
    }).catch(err => console.log(err.message));
    if (!_club_member) {
        const club_member = new ClubMembers({
            user: fromUser,
            club: new mongoose.Types.ObjectId(club_id),
            request_type: RequestType.REQUEST,
        });
        await club_member.save().catch(err => {
            return false;
        });
        return true;
    } else {
        return false;
    }
}

const get_club_members = async(_id) => {
    const _club_members = await ClubMembers.find({club: _id, enabled: true});
    return _club_members.map(e=>e.user);
}

const get_in_club_ids = async(user) => {
    const club_members = await ClubMembers.find({user, enabled: true}).catch(err => console.log(err.message));
    console.log(club_members);
    return club_members.map(e => e.club);
}
module.exports = {
    remove_fields,
    get_clubs,
    request,
    invite,
    get_club_members,
    get_in_club_ids,
}