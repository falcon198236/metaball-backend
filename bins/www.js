
const { ENV_PATH } = require('../src/configs/path');

require('dotenv').config({ path: ENV_PATH });
require('../src/db')
require('./http')
