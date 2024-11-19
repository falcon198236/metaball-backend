const mongoose = require('mongoose');
/**
 * Get port from environment and store in Express.
 */

const { DB_MSG_PORT } = require('./configs/database');
/**
 * Connect Monogo Database.
 */

/**
 * Connect Monogo Database.
 */
mongoose.set('strictQuery', true);
mongoose
  .connect(DB_MSG_PORT, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connecting to database successful');
  })
  .catch((err) => console.error('Could not connect to mongo DB', err));

