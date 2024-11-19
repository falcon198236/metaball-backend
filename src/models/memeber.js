const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    type: Number, // 0: Request,  1: Allowed Member
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MemberSchema.index({ title: 1 });

const Member = mongoose.model('member', MemberSchema);

module.exports = Member;
