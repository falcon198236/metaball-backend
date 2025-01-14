// Timeline issue fix
const mongoose = require('mongoose');
const User = require('../models/user');
const Access = require('../models/access');
const ClubMembers = require('../models/club_members');
const Club = require('../models/club');
const Content = require('../models/content');
const GolfCourse = require('../models/golfcourse');
const Location = require('../models/location');
const Prime = require('../models/prime');
const Review = require('../models/review');
const Rounding = require('../models/rounding');
const RoundingMembers = require('../models/rounding_members');
const Service = require('../models/service');
const Settings = require('../models/settings');


// require('dotenv').config({ path: ENV_PATH });
// const { DB_PORT } = require('../configs/database');
const DB_PORT = 'mongodb://admin:metaball2024@154.44.26.246:27017/metaball?authSource=admin';
mongoose
  .connect(DB_PORT, { useNewUrlParser: true })
  .then(() => {
    console.log('Connecting to database successful');

    console.log(DB_PORT);

    // migrate_blogs_theme_to_array();
    migrate_deleted();
  })
  .catch((err) => console.error('Could not connect to mongo DB', err));

const migrate = async () => {
  //  await User.updateMany({ role: 2 }, [
  //    { $set: { birthday: new Date('2020-01-01:00:00:00') } },
  //  ]);

   await User.updateMany({ role: 2 }, [
    { $set: { average_score: 80, sex: 'man', address: 'ABCDEFADADAs' } },
  ]);
  console.log('Done');
};


const migrate_blogs_theme_to_array = async() => {
  const blogs = await Blog.find({theme_id: {$exists: true}});
  console.log('========= find count: ', blogs.length);
  blogs.forEach(async(blog)  => {
    console.log('============', blog.id);
    const theme_ids = [blog.theme_id];
    await Blog.updateOne({_id: blog._id}, {$set: {theme_ids}}, {$unset: {theme_id: ""}});
    // await Blog.updateOne({_id: blog._id}, {$unset: {theme_id: ""}});
    return;
  });
  console.log('Done');
};

const migrate_deleted = async() => {
  await User.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Access.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await ClubMembers.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Club.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Content.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await GolfCourse.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Location.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Prime.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Review.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Rounding.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}}).catch((err) => {console.log(err)});
  await RoundingMembers.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Service.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  await Settings.updateMany({deleted: {$exists: false}}, {$set: {deleted: false}});
  console.log('=====');
}