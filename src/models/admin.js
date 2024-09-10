const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
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
    role: {
      type: Number,
      default: 1, // 0: super, 1: normal
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

AdminSchema.index({ email: 1, unique: true });
AdminSchema.index({ nick_name: 1 });

const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;
