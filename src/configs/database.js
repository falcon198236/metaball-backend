module.exports.DB_PORT =
  process.env.DB_PORT || 'mongodb://127.0.0.1:27017/metaball';

module.exports.DB_MSG_PORT =
  process.env.DB_MSG_PORT || 'mongodb://127.0.0.1:27017/msg_db';

module.exports.DB_NAME = process.env.DB_NAME || 'metaball';
