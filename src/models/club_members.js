const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClubMembersSchema = new Schema(    
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    request_type: { type: String, default: 'request'}, // request, invite, own
    // toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user'}, // in case of invite, it is avaliable.
    enabled: { type: Boolean, default: false}
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const ClubMembers = mongoose.model('club_members', ClubMembersSchema);

module.exports = ClubMembers;
