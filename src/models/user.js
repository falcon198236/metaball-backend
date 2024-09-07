const mongoose = require('mongoose');
const { appdb } = require('../db');

const Schema = mongoose.Schema;
const system_settings = require('../configs/system_settings');

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
    last_login_at: Date, 
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
