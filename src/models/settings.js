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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SettingsSchema.index({ title: 1 });

const Settings = mongoose.model('settings', SettingsSchema);

module.exports = Settings;
