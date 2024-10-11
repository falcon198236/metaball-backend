// Timeline issue fix
const mongoose = require('mongoose');
const User = require('../models/user');

// require('dotenv').config({ path: ENV_PATH });
const { DB_PORT } = require('../configs/database');

mongoose
  .connect(DB_PORT, { useNewUrlParser: true })
  .then(() => {
    console.log('Connecting to database successful');
    migrate();
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
