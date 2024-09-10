const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClubSchema = new Schema(
  {
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    logo: String,
    cost: {
      type: Number,
      default: 0,  // not cost
    },
    age_limit: {
      type: Number,
      default: 0,  // not limit
    },
    main_location: String,
    instroduction: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ClubSchema.index({ name: 1 });

const Club = mongoose.model('club', ClubSchema);

module.exports = Club;
