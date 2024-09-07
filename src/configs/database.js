module.exports.DB_PORT =
  process.env.DB_PORT || 'mongodb://127.0.0.1:27017/metaball';

module.exports.DB_TEST_PORT =
  process.env.DB_TEST_PORT || 'mongodb://127.0.0.1:27017/test_db';

module.exports.DB_NAME = process.env.DB_NAME || 'metaball';
