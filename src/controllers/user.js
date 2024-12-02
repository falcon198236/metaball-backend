const moment = require('moment');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");

const User = require('../models/user');

const { 
    change_password: change_password_helper,
    social_login: social_login_helper,
} = require('../helpers/user');
const api = require('../configs/api');
const sgMail = require('@sendgrid/mail');
const googleClient = new OAuth2Client(api.GOOGLE_API_CLIENT_ID);
const xClient = new OAuth2Client(api.X_API_CLIENT_ID);

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
    create: createUser,
    get_profile,
} = require('../helpers/user');
const { UserHidenField } = require('../constants/security');
const { error } = require('console');
const app = require('../app');

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
    const { currentUser } = req;
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
        data: {
            ...user._doc,
            is_followed,
        },
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
        .populate('location')
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
    const { currentUser } = req;
    const { _id } = req.params;
    const {status, profile} = await get_profile(_id);
    if (!status) {
        return res.status(400).send({
            status,
            error: 'there is no such user'
        })
    }

    const is_followed = currentUser.follow_user_ids.findIndex(e => e.toString() === _id.toString()) > -1? true: false;
    const is_blocked = currentUser.block_user_ids.findIndex(e => e.toString() === _id.toString()) > -1? true: false;
    return res.send({
        status,
        data: {
            ...profile,
            is_followed,
            is_blocked,
        }
    });
};

// change paassword of current user
const change_password = async (req, res) => {
    const { currentUser } = req;
    const { old_pwd, new_pwd } = req.body;

    const old_hash = crypto
        .pbkdf2Sync(old_pwd, currentUser.salt, 10000, 512, 'sha512')
        .toString('hex');
    if(old_hash !== currentUser.hash) {
        return res.status(202).send({
            status: false,
            error: 'Invalid old password.',
        });
    }
    const {status, error} = await change_password_helper(currentUser._id, new_pwd);
    if (!status)
        return res.status(400).send({
            status: false,
            error,
        })
    
    return res.send({
        status: true,
    });
};

const email_send_code = async (req, res) => {
    const { email } = req.body;
    const templatePath = path.join('./', 'templates', 'verify.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

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
        verification_code: code,
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
//
const forgot_pwd = async(req, res) => {
    const { email } = req.body;
    // send email
    const user = await User.findOne({email});
    if(!user) {
        return res.status(203).send({
            status: false,
            code: 203,
            error: 'there is no user',
        })
    }
   
    const templatePath = path.join('./', 'templates', 'forgot.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

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
        verification_code: code,
        //data: result
    })
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

    const {status, error} = await change_password_helper(user._id, password);
    if (!status)
        return res.status(400).send({
            status: false,
            error,
        })
    
    return res.send({
        status: true,
    });
}

const block_user = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.body;
    const user = await User.findOne({_id});
    if (!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user',
        });
    }
    const index = currentUser.block_user_ids?.findIndex(e => e.toString() === _id);
    if(index > -1) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'this user already was blocked',
        })
    }
    const block_user_ids = currentUser.block_user_ids || [];
    block_user_ids.push(_id);
    console.log(block_user_ids, currentUser._id);
    const result = await User.updateOne({_id: currentUser._id}, {$set: {block_user_ids}}).catch(err =>{
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message
        });
    });
    return res.send({
        status: true,
        code: 200,
        data: result
    });
}

const unblock_user = async (req, res) => {
    const {currentUser} = req;
    const {_id} = req.body;
    const user = await User.findOne({_id});
    if (!user) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no user',
        });
    }
    const index = currentUser.block_user_ids?.findIndex(e => e.toString() === _id);
    if(index == -1) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'this user was not blocked',
        })
    }
    const block_user_ids = currentUser.block_user_ids || [];
    block_user_ids.splice(index, 1);
    const result = await User.updateOne({_id: currentUser._id}, {$set: {block_user_ids}}).catch(err =>{
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message
        });
    });
    return res.send({
        status: true,
        code: 200,
        data: result
    });
}

// google sign up with google token
const google_signup = async (req, res) =>{
    const {token: social_token} = req.body;
    let email;
    try {
        const ticket = await googleClient.verifyIdToken({
          idToken: social_token,
          audience: app.GOOGLE_CLIENT_ID,
        });
        const _payload = ticket.getPayload();
        email = _payload["email"];
        const name = _payload["name"];

        const {status: status_create, data: code, error} = await createUser({
            email,
            fullname: name,
            password: 'google',
        });
        if (!status_create) {
            throw new Error(error);
        }
    } catch (err) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    }
    
    const {status, token, user} = social_login_helper(email); 
    if (!status) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'can`t login with google account',
        });
    }
    return res.send({
        status: true,
        data: {
            token,
            user,
        }
    })

    
}
// google login with google token
const google_login = async (req, res) =>{
    const {token: social_token} = req.body;
    let email;
    try {
        const ticket = await googleClient.verifyIdToken({
          idToken: social_token,
          audience: app.GOOGLE_CLIENT_ID,
        });
        const _payload = ticket.getPayload();
        email = _payload["email"];
    } catch (err) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    }
    
    const {status, token, user} = social_login_helper(email); 
    if (!status) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'can`t login with google account',
        });
    }
    return res.send({
        status: true,
        data: {
            token,
            user,
        }
    })
}

// x sign up with google token
const x_signup = (req, res) =>{
    const {token: social_token} = req.body;
    return res.send({
        status: true,
        code: 200,
        data: result,
    });
}

// x login with google token
const x_login = (req, res) =>{
    const {token: social_token} = req.body;
    return res.send({
        status: true,
        code: 200,
        data: result,
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
    change_password,
    email_send_code,
    check_forgot_code,
    reset_password,
    forgot_pwd,
    block_user,
    unblock_user,

    // social sign up & login
    google_signup,
    google_login,
    x_signup,
    x_login,
}