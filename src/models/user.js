const mongoose = require('mongoose');
const { appdb } = require('../db');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullname: String,
    nickname: String,

    email: {
      type: String,
      required: true,
      unique: true  // Ensure email is unique
    },
    hash: String,
    salt: String,
    phone: String,
    logo: String,
    address: String,
    introduce: String,
    themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'settings' }],
    accesses: [{type: mongoose.Schema.Types.ObjectId, ref: 'access'}], //only for admin
    experience_years: { //高尔夫历
      type: Number,
      default: 0,
    },
    average_score : {  //平均分
      type: Number,
      default: 0,
    },
    month_average_score : {  //月平均次数
      type: Number,
      default: 0,
    },
    follow_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], //내가 follow한것
    follow_club_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'club' }], //내가 follow한것
    
    last_login_at: Date, 
    role: {type: Number, default: 2},
    deleted: {type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

UserSchema.index({ email: 1, unique: true });
UserSchema.index({ nick_name: 1 });

const User = mongoose.model('user', UserSchema);

module.exports = User;
