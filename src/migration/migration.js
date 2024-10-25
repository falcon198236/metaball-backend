// Timeline issue fix
const mongoose = require('mongoose');
const User = require('../models/user');
const Blog = require('../models/blog');

// require('dotenv').config({ path: ENV_PATH });
const { DB_PORT } = require('../configs/database');

mongoose
  .connect(DB_PORT, { useNewUrlParser: true })
  .then(() => {
    console.log('Connecting to database successful');
    migrate_blogs_theme_to_array();
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