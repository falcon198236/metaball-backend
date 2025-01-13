const boolean = require('@hapi/joi/lib/types/boolean');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SettingsSchema = new Schema(
  {
    title: String,
    type: {
      type: String,
      default: 'theme', // 
      // golf hit, hit
      // golf experience, experience
      // user's theme , theme
      // blog's theme, blog
    },
    file: { type: String, default: ''},
    enable_feadback: { type: Boolean, default: true},
    active: { type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SettingsSchema.index({ title: 1, unique: true  });

const Settings = mongoose.model('settings', SettingsSchema);

module.exports = Settings;
