const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContentSchema = new Schema(
  {
    title: {type: String, default: ''},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    file: {type: String, default: ''},
    html: {type: String, default: ''},
    sub_type: {type: String, default: ''}, // it is only for news
    type: {
      type: String,
      default: 'news', // event, advertision,  news
    },
    active: { type: Boolean, default: true},
    rounding: { type: mongoose.Schema.Types.ObjectId, ref: 'rounding' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ContentSchema.index({ title: 1 });

const Content = mongoose.model('content', ContentSchema);

module.exports = Content;
