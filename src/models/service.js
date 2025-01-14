const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ServiceSchema = new Schema(
  {
    title: { type: String, default: ''},
    icon: { type: String, default: ''},
    html: { type: String, default: ''},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    enabled: { type: String, default: true},
    order: {type: Number, default: 0},
    deleted: {type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Service = mongoose.model('service', ServiceSchema);

module.exports = Service;
