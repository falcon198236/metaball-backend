const catchError = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (e) {
      console.error(e);
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
