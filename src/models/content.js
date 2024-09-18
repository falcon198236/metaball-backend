const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContentSchema = new Schema(
  {
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    files: [{type: String}],
    intro: String,
    type: {
      type: String,
      default: 'blog', // blog, notification, event, information, news
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club'}, //if event case.
    
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ContentSchema.index({ title: 1 });

const Content = mongoose.model('content', ContentSchema);

module.exports = Content;
