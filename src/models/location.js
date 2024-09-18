const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LocationSchema = new Schema(
  {
    name: String,
    map_link: String
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

LocationSchema.index({ title: 1 });

const Location = mongoose.model('location', LocationSchema);

module.exports = Location;
