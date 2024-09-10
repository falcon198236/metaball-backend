const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    name: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blog' },
    instroduction: String,
    files: [{type: String}],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ReviewSchema.index({ nick_name: 1 });

const Blog = mongoose.model('review', ReviewSchema);

module.exports = Blog;
