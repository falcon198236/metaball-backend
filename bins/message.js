const express = require('express');
const http = require('http');
const { ENV_PATH } = require('../src/configs/path');

require('dotenv').config({ path: ENV_PATH });
require('../src/db');

var socketio = require('socket.io');
const chat = require('../src/controllers/chat');

const app = express();

let server = http.createServer(app);

let port = normalizePort(process.env.MSG_PORT || '3001');
app.set('port', port);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('App listening on', bind);
  // debug('Listening on ' + bind);
}
// Initialize Socket.IO with the server
const io = socketio(server, {
  cors: {
    origin: '*',
  }
});	



// When a client connects
chat.init(io);
io.sockets.on('connection', function(socket) {
  socket.on('login', function(_id){
      chat.connect(socket, _id);
  });
  socket.on('logout', function() {
    chat.disconnect(socket);        
  });
  socket.on('message', function(_id, msg) {
    chat.send_dm_message(socket, _id, msg);        
  });
  socket.on('broadcast', function(_id, msg) {
    chat.broadcast(socket, _id, msg);        
  });
  socket.on('disconnect', () => {
    chat.disconnect(socket);
  })
});




