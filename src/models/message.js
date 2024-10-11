const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    msg: String,
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' }, // club message
    files: [{type: String}],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MessageSchema.index({ user: 1 });

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;
