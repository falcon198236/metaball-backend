const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoundingSchema = new Schema(    
  {
    title: String,  // 标题
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'club' },
    type: { type: String, default: 'user'}, // user, club
    introduction: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'location'}, // 主办地
    place: String, // 场地名
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'golfcourse'}, 
    type: String, //user and club, if rounding is created by user, type is 'person' and otherwise, type is 'club'
    sex: { type: String, default: 'both'}, // both, man, woman,
    golf_course_name: { type: String, default: ''}, 
    golf_course_address: { type: String, default: ''}, 
    golf_themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'settings'}],
    golf_hits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'settings'}],
    golf_experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'settings'}],
    age_start: { type: Number, default: 0},
    age_end: { type: Number, default: 100},
    // members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    max_members: {type: Number, default: 4},    // 募集人数
    opening_date: Date, // 開催日
    cost: Number,   // 参加費
    deleted: {type: Boolean, default: false},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

RoundingSchema.index({ title: 1 });

const Rounding = mongoose.model('rounding', RoundingSchema);

module.exports = Rounding;
