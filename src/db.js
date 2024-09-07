const mongoose = require('mongoose');
/**
 * Get port from environment and store in Express.
 */

const { DB_PORT } = require('./configs/database');
/**
 * Connect Monogo Database.
 */

const appdb = mongoose.createConnection(
  DB_PORT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('app db err', err);
    } else {
      console.log('app db connected');
    }
  }
);


module.exports = { appdb };
