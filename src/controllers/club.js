const fs = require('fs');
const Club = require('../models/club');
const { mongoose } = require('mongoose');
const { SystemActionType } = require('../constants/type');
const User = require('../models/user');

const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    if (currentUser.role == 2) {
        req.body.user = currentUser._id;
    } else {
        if (!req.body.user) {
            return res.status(400).send({
                status: false,
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
            error: err.message,
        })
    });
    return res.send({ status: true, data: result });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const _files = req.files?.map(f => f.path);
    const club = await Club.findOne({_id}).catch(err=> console.log(err.message));
    if (currentUser.role === 2 && club.user.toString() !== currentUser._id.toString()) {
        return res.status(400).send({
            status: false,
            error: `you can't update because you are not the owner of this club.`,
        })
    }
    if (_files?.length) {
        if (club.logo) {
            try {
                fs.unlinkSync(club.logo);
            }catch(err) {
                console.log(err.message);
            }
        }
        req.body['logo'] = _files[0];
    }
    const result = await Club.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({status: true, data: result});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{created_at: {$gte: new Date('2000-1-1')}}];
    if (key)
        query.push({name: {$regex: `${key}.*`, $options:'i' }});
    const count = await Club.countDocuments({$and: query});
    const clubs = await Club.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip,
        }
    ]);

    return res.send({ status: true, data: {count, clubs} });
};

const remove = async (req, res) => {
    const { _id } = req.params;
    const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no club',
        });
    }

    if (club['logo']) {
        if(fs.existsSync(club['logo'])) {
            fs.unlinkSync(club['logo']);    
        }
    }
    const result = await Club.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const { ids } = req.body;
    
    const clubs = await Club.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    clubs.forEach(u => {
        if (u['logo']) {
            if(fs.existsSync(u['logo'])) {
                fs.unlinkSync(u['logo']);    
            }
        }   
    });

    const result = await Club.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        })
    }
    return res.send({
        status: true,
        data: club,
    })
};


const getMyClubs = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const clubs = await Club.aggregate([
        {
            $match: {
                user: currentUser._id,
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'member_ids',
                foreignField: "_id",
                as: "members"
            }
        },
        {
            $unwind: {
              path: "$members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'request_member_ids',
                foreignField: "_id",
                as: "request_members"
            }
        },
        {
            $unwind: {
              path: "$request_members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: limit, 
        },
        {
            $skip: skip,
        },
    ]);
    return res.send({
        status: true,
        data: clubs,
    })
};

const getMeInClubs = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    console.log('curr-------', currentUser._id);
    const clubs = await Club.aggregate([
        {
            $match: {
                member_ids: currentUser._id,
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'member_ids',
                foreignField: "_id",
                as: "members"
            }
        },
        {
            $unwind: {
              path: "$members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'request_member_ids',
                foreignField: "_id",
                as: "request_members"
            }
        },
        {
            $unwind: {
              path: "$request_members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: limit? parseInt(limit) : 10, 
        },
        {
            $skip: skip? parseInt(skip) : 0
        }, 
    ]);
    return res.send({
        status: true,
        data: clubs,
    })
};

const getRequestClubs = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
    const clubs = await Club.aggregate([
        {
            $match: {
                request_member_ids: currentUser._id,
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'member_ids',
                foreignField: "_id",
                as: "members"
            }
        },
        {
            $unwind: {
              path: "$members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $lookup: {
                from: 'user',
                localField: 'request_member_ids',
                foreignField: "_id",
                as: "request_members"
            }
        },
        {
            $unwind: {
              path: "$request_members",
              preserveNullAndEmptyArrays: true // Optional: keep users without an order
            }
        },
        {
            $limit: limit? parseInt(limit) : 10, 
        },
        {
            $skip: skip? parseInt(skip) : 0
        }, 
    ]);
    return res.send({
        status: true,
        data: clubs,
    })
};

const getMembers = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const club = await Club.findOne({_id, user: currentUser._id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }
    const users = await User.find({_id: {$in: club.member_ids}}).catch(err=>console.log(err.message));
    return res.send({
        status: true,
        data: users,
    })
};
const addMembers = async (req, res) => {
    const { currentUser } = req;
    const { club: _id, member_ids: _member_ids } = req.body;
    const club = await Club.findOne({_id, user: currentUser._id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }

    const request_member_ids = club.request_member_ids;
    const member_ids = club.member_ids;
    const already_added_ids = [];
    const added_ids = [];
    console.log(request_member_ids);
    console.log(_member_ids);
    _member_ids.forEach(id => {
        const b = request_member_ids?.findIndex(member => member.toString() == id);
        if (b >=0) { 
            // remove id from request list
            request_member_ids.splice(b, 1);
        }
        const c = member_ids?.findIndex(member => member.toString() == id);
        if (c >= 0) {
            already_added_ids.push(new mongoose.Types.ObjectId(id));
        }else {
            added_ids.push(new mongoose.Types.ObjectId(id));
            member_ids.push(new mongoose.Types.ObjectId(id));
        }
    });
    const result = await Club.updateOne({_id}, {
        $set: {
            member_ids,
            request_member_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        data: {
            already_added_ids,
            added_ids,
        },
    })
};

const removeMembers = async (req, res) => {
    const { currentUser } = req;
    const { club: _id, member_ids: _member_ids } = req.body;
    const club = await Club.findOne({_id, user: currentUser._id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }
    const deletes_ids = [];
    const member_ids = club.member_ids;
    _member_ids.forEach(id => {
        if(id !== currentUser.id) {
            const b = member_ids?.findIndex(member => member.toString() == id);
            console.log(b, id);
            if (b >=0) {
                member_ids.splice(b, 1);
                deletes_ids.push(id);
            }
        }
    });
    
    await Club.updateOne({_id}, {
        $set: {
            member_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        data: deletes_ids,
    })
};

const cancelRequestMember = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.query;
    const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }

    const a = club.request_member_ids.findIndex(member => member.toString() == currentUser._id.toString());
    if (a < 0) {
        return res.status(201).send({
            status: false,
            error: 'you do not request this club',
        })
    }
    club.request_member_ids.splice(b, 1);

    const result = await Club.updateOne({_id}, {
        $set: {
            request_member_ids: club.request_member_ids,
        }
    }).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });
    return res.send({
        status: true,
        data: {
            result
        },
    })
};
module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,

    // functions for Client
    getMyClubs,         // My clubs
    getMeInClubs,       // clubs that I am as member
    getRequestClubs,    // Clubs that I request.
    getMembers,
    addMembers,          // Add a member
    removeMembers,       // Remove a member
    cancelRequestMember,    // Cancel a request .
}