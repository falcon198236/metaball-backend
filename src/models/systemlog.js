const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SystemlogSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    section: String,
    action: String,
    data: Object,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Systemlog = mongoose.model('Systemlog', SystemlogSchema);

module.exports = Systemlog;
