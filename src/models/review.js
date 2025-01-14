const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'content' },
    deleted: {type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Review = mongoose.model('review', ReviewSchema);

module.exports = Review;
