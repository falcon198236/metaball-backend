const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    message: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    files: [{type: String}],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MessageSchema.index({ user: 1 });

const Message = mongoose.model('content', MessageSchema);

module.exports = Message;
