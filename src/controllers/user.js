const moment = require('moment');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { change_password } = require('../helpers/user');
const api = require('../configs/api');
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
    create: createUser,
    get_profile,
} = require('../helpers/user');
const { UserHidenField } = require('../constants/security');
const { error } = require('console');

const SECTION = 'user';
const signup = async(req, res) => {
    req.body.role = 2;
    const _files = req.files?.map(f => f.path);
    if (_files?.length) {
        req.body['logo'] = _files[0];
    }
    const {status, data, code, error} = await createUser(req.body);
    if(!status) {
        return res.status(code).send({
            status,
            code,
            error,
        })
    }
    
    return res.send({ status: true, data });
};

const update = async(req, res) => {
    const { currentUser } = req;
    const { _id: id } = req.params;
    let _id = id;
    if ( !id ) _id = currentUser._id;
    const _files = req.files?.map(f => f.path);
    const user = await User.findOne({_id}).catch(err=> console.log(err.message));
    if (!user) {
        return res.status(400).send({status: false, error: 'there is no user'});
    }
    if (_files?.length) {
        if (user.logo) {
            try {
                setTimeout(() => {
                    fs.unlinkSync(user.logo);
                }, 2000);
            }catch(err) {
                console.log(err.message);
            }
        }
        req.body['logo'] = _files[0];
    }
    const result = await User.updateOne({_id}, {$set: req.body}).catch((err) => {
        return res.status(203).send({
            status: false,
            code: 203,
            error: err.message,
        })
    });
    
    return res.send({status: true, data: result});
};

const gets = async (req, res) => {
    const { key, limit, skip } = req.query;
    const query = {role: 2};
    if (key)
        query.email = {$regex: `${key}.*`, $options:'i' };
    
    const count = await User.countDocuments(query);
    const users = await User.find(query, UserHidenField)
        .limit(limit)
        .skip(skip);

    return res.send({ status: true, data: {count, users} });
};

const remove = async (req, res) => {
    const { currentUser } = req;
    const { _id } = req.params;
    const user = await User.findOne({_id}).catch(err => console.log(err.message));
    if (!user) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        });
    }

    if (user['logo']) {
        if(fs.existsSync(user['logo'])) {
            fs.unlinkSync(user['logo']);    
        }
    }
    const result = await User.deleteOne({_id}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    
    return res.send({status: true, data: result});
};

const removes = async (req, res) => {
    const { currentUser } = req;
    const { ids } = req.body;
    
    const users = await User.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    users.forEach(u => {
        if (u['logo']) {
            if(fs.existsSync(u['logo'])) {
                fs.unlinkSync(u['logo']);    
            }
        }   
    });

    const result = await User.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(201).send({
            status: false,
            error: err.message,
        });
    });
    
    return res.send({status: true, data: result});
};

const get = async (req, res) => {
    const { _id } = req.params;
    const user = await User.findOne({_id}, UserHidenField).catch(err => console.log(err.message));
    if (!user) {
        return res.status(400).send({
            status: false,
            error: 'there is no user',
        })
    }
    return res.send({
        status: true,
        data: user,
    })
};

///////////////////////// CLIENT ///////////////////////////////
const login = async(req, res) => {
    const {email, password} = req.body;
    console.log('USER LOGIN: [', email ,']');
    const user = await User.findOne({
        $and: [
            {
                $or: [ {email: {$regex: `${email}$`, $options:'i' }},
                    {nickname: {$regex: `${email}$`, $options:'i' }}
            ]},
            { deleted: false },
        ]
        }, {
            follow_user_ids: 0,
            follow_blog_ids: 0,
            follow_rounding_ids: 0
        })
        .populate('themes')
        .catch(err => {
        console.log('there is no user');
    });
    if (!user) {
        return res.status(201).send({
            status: false,
            error: 'there is no such user.',
        });
    }
    const hash = crypto
        .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
        .toString('hex');
    if(hash !== user.hash) {
        return res.status(202).send({
            status: false,
            error: 'Invalid password.',
        });
    }
    const payload = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone
    };
    // const token = jwt.sign(payload, api.SECURITY_KEY, {
    //     expiresIn: 86400 // expires in 24 hours //86400
    // });
    const token = jwt.sign(payload, api.SECURITY_KEY);
    user.last_login_at = new Date();
    const _user = { ...user._doc, last_login_at: new Date};
    await User.replaceOne({_id: user._id}, _user, { upsert: true }).catch(err => console.log(err));
    
    return res.send({
        status: true,
        data: {
            token,
            user: _user,
        }
    })
};

const logout = async(req, res) => {
    const {currentUser} = req;
    
    res.send({
        status: true,
    })
};

// get my profile
const me = async (req, res) => {
    const { currentUser } = req;
    const {status, profile} = await get_profile(currentUser._id);
    if (!status) {
        return res.status(400).send({
            status,
            error: 'there is no such user'
        })
    }
    return res.send({
        status,
        data: profile,
    });
};

// get my profile
const profile = async (req, res) => {
    const { _id } = req.params;
    const {status, profile} = await get_profile(_id);
    if (!status) {
        return res.status(400).send({
            status,
            error: 'there is no such user'
        })
    }
    return res.send({
        status,
        data: profile,
    });
};

const changePassword = async (req, res) => {
    const { currentUser } = req;
    const { password } = req.body;
    const {status, error} = await change_password(currentUser._id, password);
    if (!status)
        return res.status(400).send({
            status: false,
            error,
        })
    
    return res.send({
        status: true,
    });
};

const forgot = async (req, res) => {
    const { email } = req.body;
    // send email
    const user = await User.findOne({email});
    if(!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user',
        })
    }
    if(user.forgot_info?.date) {
        const saved_time = moment(user.forgot_info.date);
        const now = moment();
        const diff_time = now.diff(saved_time, 'seconds');
        if(diff_time < 60) {
            return res.status(400).send({
                status: false,
                code: 400,
                error: 'You already send the request for this. please wait a little'
            });
        }
    }

    const templatePath = path.join('./', 'templates', 'forgot.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const forgot_info = {
        code,
        date: Date.now()
    }
    
    await User.updateOne({_id: user._id}, {
        $set: {forgot_info},
    }).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'can`t send the forgot email.',
        })
    });

    const htmlContent = ejs.render(template, { email, code });

    const msg = {
        to: email,       // Change to your recipient
        from: 'support@metaball.com',        // Change to your verified sender
        subject: 'Metalball account team',
        html: htmlContent,
      };
    const result = sgMail.send(msg).catch((error) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: error.message
        });
    });
    return res.send({
        status: true,
        code: 200,
        //data: result
    })
}

const check_forgot_code = async (req, res) => {
    const {email, code} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user',
        })
    }
    if(user.forgot_info?.date) {
        if (user.forgot_info.code !== code) {
            return res.status(400).send({
                status: false,
                code: 400,
                error: 'the code is not matched.'
            })
        }
        
        const saved_time = moment(user.forgot_info.date);
        const now = moment();
        const diff_time = now.diff(saved_time, 'seconds');
        if(diff_time > 60) {
            return res.status(400).send({
                status: false,
                code: 400,
                error: 'code already is expired.'
            });
        }
        await User.updateOne({_id: user._id}, {$unset: {forgot_info: true}});
        return res.send({
            status: true,
            code: 200,
        }) 
    } 
    return res.status(400).send({
        status: false,
        code: 400,
        error: 'code do not exist.'
    });

}

const reset_password = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user',
        })
    }

    const {status, error} = await change_password(user._id, password);
    if (!status)
        return res.status(400).send({
            status: false,
            error,
        })
    
    return res.send({
        status: true,
    });
}
////////////////////////////////////////////////////////////////

module.exports = {
    remove,
    removes,
    login,
    logout,
    get,
    gets,

    ////////////////// client ///////////////////
    signup,
    update,
    me,
    profile,
    changePassword,
    forgot,
    check_forgot_code,
    reset_password,
}