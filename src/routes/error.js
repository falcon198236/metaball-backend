const {sys_api_log} = require('../helpers/systemlog')
const catchError = (callback) => {
  return async (req, res, next) => {
    try {
      const result = await callback(req, res, next);
      sys_api_log(req, {status: result.statusCode === 200? true: false, code: result.statusCode});
    } catch (e) {
      console.error(e);
      sys_api_log(req, {status: false, code: 500, error: 'Internal server error'});
      return res.status(500).send({
        status: false,
        error: 'internal_server_error',
      });
    }
  };
};

const catchServiceError = (userId, error) => {
  console.error('service error', error);
  Sentry.captureException(error, {
    user: { id: userId || 'No user' },
    extra: {
      env: process.env.NODE_ENV || 'development',
    },
  });
  
};

module.exports = {
  catchError,
  catchServiceError,
};
