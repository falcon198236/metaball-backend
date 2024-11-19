const path = require('path');

module.exports.FILES_PATH = path.join(__dirname, '../..', 'files/');
module.exports.THUMBNAILS_PATH = path.join(__dirname, '../..', 'thumbnails/');
module.exports.GIF_PATH = path.join(__dirname, '../..', 'gif/');
module.exports.PREVIEW_PATH = path.join(__dirname, '../..', 'previews/');
module.exports.TEMP_PATH = path.join(__dirname, '../..', 'temp/');
module.exports.VIDEO_PATH = path.join(__dirname, '../..', 'video/');
module.exports.ENV_PATH = path.join(__dirname, '../..', '.env');
module.exports.TRAKER_PATH = path.join(__dirname, '../..', 'email.gif');
module.exports.PLAY_BUTTON_PATH = path.join(__dirname, '../..', 'overlay.png');
module.exports.VIDEO_CONVERT_LOG_PATH = path.join(
  __dirname,
  '../..',
  'video_log/'
);
