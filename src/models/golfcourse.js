const boolean = require('@hapi/joi/lib/types/boolean');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GolfCourseSchema = new Schema(
  {
    name: String,
    address: String,
    phone: String,
    deleted: {type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

GolfCourseSchema.index({ name: 1 });

const GolfCourse = mongoose.model('golfcourse', GolfCourseSchema);

module.exports = GolfCourse;
