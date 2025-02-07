const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullname: {type: String, default: ''},
    nickname: {type: String, default: ''},

    email: {
      type: String,
      required: true,
      unique: true,  // Ensure email is unique
      default: '',
    },
    birthday: {type: Date, default: new Date('2000-1-1 0:0:0')},
    sex: String, //m: man, w: woman
    hash: String,
    salt: String,
    phone: {type: String, default: ''},
    logo: {type: String, default: ''},
    address: {type: String, default: ''},
    introduction: {type: String, default: ''},
    occupation: {type: String, default: ''},
    occupation: {type: String, default: ''},
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'location'}, // 主办地
    themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'settings' }],
    accesses: [{type: mongoose.Schema.Types.ObjectId, ref: 'access'}], //only for admin
    experience: { //高尔夫历
      type: Number,
      default: 0,
    },
    hit : {  //平均分
      type: Number,
      default: 0,
    },
    month_average_score : {  //月平均次数
      type: Number,
      default: 0,
    },
    follow_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // followed users
    block_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // block users
    follow_blog_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blog' }], // followed blogs
    follow_rounding_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'rounding' }], // followed roundings
    
    last_login_at: Date, 
    is_social_login: {type: Boolean, default: false},
    role: {type: Number, default: 2},
    deleted: {type: Boolean, default: false},
    socket_id: String,
    forgot_info: {
      code: String,
      date: Date
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

UserSchema.index({ email: 1, unique: true });
UserSchema.index({ nick_name: 1 });

const User = mongoose.model('user', UserSchema);

module.exports = User;
