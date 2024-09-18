// Timeline issue fix
const mongoose = require('mongoose');
const User = require('../models/user');

require('dotenv').config({ path: ENV_PATH });
const { DB_PORT } = require('../configs/database');

mongoose
  .connect(DB_PORT, { useNewUrlParser: true })
  .then(() => {
    console.log('Connecting to database successful');
    migrate();
  })
  .catch((err) => console.error('Could not connect to mongo DB', err));

const migrate = async () => {
//   await EvenType.updateMany({ duration: { $exists: true } }, [
//     { $set: { start_time_increment: '$duration' } },
//   ]);
  console.log('Done');
};
