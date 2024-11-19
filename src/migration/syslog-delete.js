// Timeline issue fix
const mongoose = require('mongoose');
const User = require('../models/user');
const Systemlog = require('../models/systemlog');

// require('dotenv').config({ path: ENV_PATH });
const { DB_PORT } = require('../configs/database');

mongoose
  .connect(DB_PORT, { useNewUrlParser: true })
  .then(() => {
    console.log('Connecting to database successful');
    syslog_delete();
  })
  .catch((err) => console.error('Could not connect to mongo DB', err));

const syslog_delete = async () => {
  //  await User.updateMany({ role: 2 }, [
  //    { $set: { birthday: new Date('2020-01-01:00:00:00') } },
  //  ]);

   await Systemlog.deleteMany();
  console.log('Done');
};
