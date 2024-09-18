const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SettingsSchema = new Schema(
  {
    title: String,
    type: {
      type: String,
      default: 'theme', // 
      //  골르라이프 관리 , life
      // 평규 타수 관리, hit
      // 골프 경력, experience
      // 골프 노트 분류 note
      // 초청자 분류, invitor
      // 찾는 라운딩 타입, rounding
      // 인기 라운딩 테마 , theme
      // 모임 관리          meeting
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SettingsSchema.index({ title: 1 });

const Settings = mongoose.model('settings', SettingsSchema);

module.exports = Settings;
