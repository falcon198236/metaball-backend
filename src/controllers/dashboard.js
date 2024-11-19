const User = require('../models/user');
const Rounding = require('../models/rounding');
const Club = require('../models/club');
const SECTION = 'dashboard';

const get = async(req, res) => {
    const user_count = await User.countDocuments({role:2, deleted: false});
    const rounding_count = await Rounding.countDocuments();
    const club_count = await Club.countDocuments();
    return res.send({ 
        status: true, 
        code: 200, 
        data: {
            users: user_count || 0,
            roundings: rounding_count || 0,
            clubs: club_count || 0,
        } });
};

module.exports = {
    get,
}