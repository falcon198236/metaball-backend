const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PrimeSchema = new Schema(
  {
    title: { type: String, default: ''},
    icon: { type: String, default: ''},
    html: { type: String, default: ''},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    enabled: { type: String, default: true},
    order: {type: Number, default: 0}
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Prime = mongoose.model('prime', PrimeSchema);

module.exports = Prime;
