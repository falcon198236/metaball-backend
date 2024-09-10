const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccessSchema = new Schema(
  {
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    options: [{ type: Object}],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

AccessSchema.index({ title: 1 });

const Access = mongoose.model('access', AccessSchema);

module.exports = Access;
