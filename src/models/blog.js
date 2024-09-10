const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlogSchema = new Schema(
  {
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    files: [{type: String}],
    intro: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

BlogSchema.index({ title: 1 });

const Blog = mongoose.model('blog', BlogSchema);

module.exports = Blog;
