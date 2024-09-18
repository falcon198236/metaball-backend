const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoundingSchema = new Schema(
  {
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    intro: String,
    type: String, //user and club, if rounding is created by user, type is 'person' and otherwise, type is 'club'
    themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'theme'}],
    cost: Number,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'location'},
    map_link: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    max_members: {type: Number, default: 0},
    start_time: Date,
    best_score: Number,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

RoundingSchema.index({ title: 1 });

const Rounding = mongoose.model('rounding', RoundingSchema);

module.exports = Rounding;
