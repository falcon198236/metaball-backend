const Rounding = require('../models/rounding');
const RoundingMembers   = require('../models/rounding_members');
const { UserHidenField } = require('../constants/security');

const getRoundings = async (query, limit = 10, skip = 0) =>{
    const count = await Rounding.countDocuments(query);
    const _roundings = await Rounding.find(query)
        .populate({
            path: 'user',
            UserHidenField,
        })
        .populate('club')
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
module.exports = {
    getRoundings,
}