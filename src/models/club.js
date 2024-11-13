const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClubSchema = new Schema(
  {
    name: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, //owner
    logo: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'location'},
    introduction: { type: String, default: ''},
    qualification: {
      type: String,
      default: '',  // not cost
    },
    move_range: { type: String, default: ''},
    limit_age: { type: String, default: ''},
    join_approval: { type: String, default: 'owner'},
    admin_selection: { type: String, default: 'owner'},
    manager_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}], 
    event_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'content'}],  
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ClubSchema.index({ name: 1 });

const Club = mongoose.model('club', ClubSchema);

module.exports = Club;
