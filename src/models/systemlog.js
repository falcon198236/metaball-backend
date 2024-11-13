const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SystemlogSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    type: String,
    action: String,
    data: Object,
    status: {type: Boolean},
    code: {type: Number},
    error: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Systemlog = mongoose.model('systemlog', SystemlogSchema);

module.exports = Systemlog;
