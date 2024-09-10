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
    icon: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    followered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    experience_years: {
      type: Number,
      default: 0,
    },
    best_score: {
      type: Number,
      default: 0,
    },
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
