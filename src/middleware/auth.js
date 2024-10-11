const User = require('../models/user');
const jwt = require('jsonwebtoken');
const api = require('../configs/api.js');

const checkAuth = async (req, res, next) => {
  const bearer_token = req.get('Authorization');
  const token = bearer_token.replace('Bearer ', '');
  let decoded; 
  try {
    decoded = jwt.verify(token, api.SECURITY_KEY);
  } catch (err) {
    console.log('check verify error', err.message || err.msg);
  }
  //  console.log(decoded);
  if (!decoded) {
    return res.status(401).send({
      status: false,
      error: 'Authorization failed',
    });
  }
  req.currentUser = await User.findOne({
    _id: decoded?.id,
  }).catch((err) => {
    console.log('err', err);
  });
  console.log('user:[', req.currentUser.id, '] [', req.currentUser.email, '] - ', req.originalUrl);
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


const checkAdminAuth = async (req, res, next) => {
  const bearer_token = req.get('Authorization');
  const token = bearer_token?.replace('Bearer ', '');
  let decoded; 
  try {
    decoded = jwt.verify(token, api.SECURITY_ADMIN_KEY);
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
  }).catch((err) => {
    console.log('err', err);
  });
  
  if (req.currentUser) {
      next();
  } else {
    res.status(401).send({
      status: false,
      error: 'invalid_user',
    });
  }
};


module.exports = {
  checkAuth,
  checkAdminAuth,
};

