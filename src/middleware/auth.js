const User = require('../models/user');
const jwt = require('jsonwebtoken');
const api = require('../configs/api.js');

const checkAppJwtAuth = async (req, res, next) => {
  const bearer_token = req.get('Authorization');
  const token = bearer_token.replace('Bearer ', '');
  let decoded; 
  try {
    decoded = jwt.verify(token, api.SECURITY_KEY);
  } catch (err) {
    console.log('check verify error', err.message || err.msg);
  }

  if (!decoded) {
    return res.status(401).send({
      status: false,
      error: 'Authorization failed',
    });
  }

  req.currentUser = await User.findOne({
    _id: decoded?.id,
    deleted: false,
  }).catch((err) => {
    console.log('err', err);
  });

  if (req.currentUser) {
      next();
  } else {
    console.error('Valid JWT but no user:', decoded);
    res.status(401).send({
      status: false,
      error: 'invalid_user',
    });
  }
};

module.exports = {
  checkAppJwtAuth,
};
