const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DMSchema = new Schema(
  {
    user_1: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    user_2: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

DMSchema.index({ user: 1 });

const DM = mongoose.model('message_channel', DMSchema);

module.exports = DM;
