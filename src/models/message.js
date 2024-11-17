const mongoose = require('mongoose');
const { MessageType, MessageResponseStatus } = require('../constants/type')
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    msg: { type: String, default: ''},
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' }, // club message
    file: {type: String, default: ''},
    type: {type: String, default: MessageType.NORMAL},
    response_status: {type: String, default: MessageResponseStatus.NONE},
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clubclub_members' }, // club member id
    rounding: { type: mongoose.Schema.Types.ObjectId, ref: 'rounding' },
    status: { type: Boolean, default: false}
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

MessageSchema.index({ user: 1 });

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;
