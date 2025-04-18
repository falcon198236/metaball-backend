const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
// const timeout = require('connect-timeout');

const appRouter = require('./routes/');
const adminRouter = require('./routes/admin');
const { createSuperManager } = require('./helpers/manager')
const app = express();


const corsConfig = {
  credentials: false,
  origin: false,
}
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
// app.use((req, res, next) => {
//   const { decoded, isPublic } = verifyToken(req, res);
//   req.decoded = decoded;
//   req.isPublic = isPublic;
//   logIncomingRequest(req);
//   next();
// });

app.use('/uploads', express.static('uploads')); 
app.use('/public', express.static('public')); 
app.get('/hello', (req, res) => {
  res.send(`Metaball API Cool!: Project= '${process.env.PROJECT}'`);
});
app.use('/', appRouter);
app.use('/admin', adminRouter);

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
});

// create super admin
createSuperManager();
const logIncomingRequest = (req) => {
  // eslint-disable-next-line no-nested-ternary
  const user = req.decoded
    ? req.decoded.id
    : req.isPublic
    ? 'Public'
    : 'Auth failed';
  const endpoint = req.path;
  const time = new Date().toISOString();
  const id = uuidv4();
  req.id = id;
  console.log(
    JSON.stringify({
      type: 'incoming',
      user,
      time,
      endpoint,
      method: req.method,
      id,
    })
  );
};

module.exports = app;
