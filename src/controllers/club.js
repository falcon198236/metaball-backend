const fs = require('fs');
const Club = require('../models/club');
const { default: mongoose } = require('mongoose');

const create = async(req, res) => {
    const { currentUser } = req;
    const _files = req.files?.map(f => f.path);
    const data = {
        ... req.body,
        user: currentUser._id,
    }
    if(_files?.length) data.logo = _files[0];
    const club = new Club({data});
    const result = await club.save().catch(err => {
        return res.status(400).send({
            status,
            error: err.message,
        })
    });
    return res.send({ status: true, data: {result} });
};

const update = async(req, res) => {
    const { _id } = req.params;
    const _files = req.files?.map(f => f.path);
    const club = await Club.findOne({_id}).catch(err=> console.log(err.message));
    if (!user) {
        return res.status(400).send({status: false, error: 'there is no club'});
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
    return res.send({status: true, data: {result}});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = [{createdAt: {$gte: new Date('2000-1-1')}}];
    if (key)
        query.push({name: {$regex: `${key}.*`, $options:'i' }});
    
    const count = await Club.countDocuments({$and: query});
    const clubs = await Club.aggregate([
        {
            $match: {$and: query},
        },
        {
            $limit: parseInt(limit), 
        },
        {
            $skip: parseInt(skip)
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
    return res.send({status: true, data: {result}});
};

const removes = async (req, res) => {
    const { _ids } = req.body;
    
    const clubs = await Club.find({_id: {$in: _ids}}).catch(err => console.log(err.message));
    clubs.forEach(u => {
        if (u['logo']) {
            if(fs.existsSync(u['logo'])) {
                fs.unlinkSync(u['logo']);    
            }
        }   
    });

    const result = await Club.deleteMany({_id: {$in: _ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    return res.send({status: true, data: {result}});
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
        data: {
            club,
        },
    })
};


// functions for Clients
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

const getMeInClubs = async (req, res) => {
    const { currentUser } = req;
    const { limit, skip } = req.query;
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

const addMember = async (req, res) => {
    const { currentUser } = req;
    const { club: _id, member: member_id } = req.body;
    const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }

    const a = club.member_ids.findIndex(member => member.toString() == member_id);
    if (a >=0) {
        return res.status(201).send({
            status: false,
            error: 'already added the user as member in this club',
        })
    }
    const b = club.request_member_ids?.findIndex(member => member.toString() == member_id);
    if (b >=0) {
        club.request_member_ids.splice(b, 1);
    }
    club.member_ids.push(mongoose.Schema.Types.ObjectId(member_id));
    const result = await Club.updateOne({_id}, {
        $set: {
            member_ids: club.member_ids,
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

const removeMember = async (req, res) => {
    const { currentUser } = req;
    const { club: _id, member: member_id } = req.body;
    const club = await Club.findOne({_id}).catch(err => console.log(err.message));
    if (!club) {
        return res.status(400).send({
            status: false,
            error: 'there is no such club.',
        })
    }

    const a = club.member_ids.findIndex(member => member.toString() == member_id);
    if (a < 0) {
        return res.status(201).send({
            status: false,
            error: 'there is no user as member in this club',
        })
    }
    club.member_ids.splice(b, 1);

    const result = await Club.updateOne({_id}, {
        $set: {
            member_ids: club.member_ids,
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
    addMember,          // Add a member
    removeMember,       // Remove a member
    cancelRequestMember,    // Cancel a request .
}