const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClubSchema = new Schema(
  {
    name: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, //owner
    logo: String,
    location: String,
    introduction: String,
    cost: {
      type: Number,
      default: 0,  // not cost
    },
    member_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    request_member_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    event_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'event'}],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ClubSchema.index({ name: 1 });

const Club = mongoose.model('club', ClubSchema);

module.exports = Club;
