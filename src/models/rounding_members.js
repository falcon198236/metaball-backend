const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoundingMembersSchema = new Schema(    
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    rounding: { type: mongoose.Schema.Types.ObjectId, ref: 'rounding' },
    request_type: { type: String, default: 'request'}, // request, invite, own
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user'}, // in case of invite, it is avaliable.
    enabled: { type: Boolean, default: false}
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const RoundingMembers = mongoose.model('rounding_members', RoundingMembersSchema);

module.exports = RoundingMembers;
