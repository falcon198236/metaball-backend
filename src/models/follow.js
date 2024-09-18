const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FollowSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    person: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    type: String, // person, club, event, .......
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ReviewSchema.index({ nick_name: 1 });

const Follow = mongoose.model('follow', FollowSchema);

module.exports = Follow;
