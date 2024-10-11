const mongoose = require('mongoose');
const { syslog } = require('../helpers/systemlog');
const Message = require('../models/message');
const User = require('../models/user');
const { UserHidenField } = require('../constants/security');
const SECTION = 'chat';

var socket_io;

const init = async(io) => {
    socket_io = io;
    await User.updateMany({}, {$unset: {socket_id: true}});
};

const connect = async (socket, _id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        socket_io.to(socket.id).emit("400","Invalid value: " + _id);
        socket.disconnect();
        return;
    };
    const user = await User.findOne({_id: new mongoose.Types.ObjectId(_id)}).catch(err => console.log("ERROR:", err.message));
    if (!user) {
        socket_io.to(socket.id).emit("400","Name Changed Successfully .... " + _id);    
        socket.disconnect();
        return;
    }
    await User.updateOne({_id}, {$set: {socket_id: socket.id}}).catch(err => {
        socket_io.to(socket.id).emit("400","Falied updating user model.");    
        socket.disconnect();
    });

    socket_io.to(socket.id).emit("200","Connected");    
};

const disconnect = async(socket) => {
    await User.updateOne({socket_id: socket.id}, {$unset: {socket_id: true}}).catch(err => {
        console.log(err.message);
    });
    socket_io.to(socket.id).emit("400","Disconnected");    
    if(socket.connected) socket.disconnect();

};

const send_dm_message = async (socket, user, msg) => {
    if (!mongoose.Types.ObjectId.isValid(user)) {
        socket_io.to(socket.id).emit("400","there is no such user");
        return;
    };
    const from_user = await User.findOne({socket_id: socket.id}, UserHidenField).catch(err => console.log("ERROR:", err.message));
    if (!from_user) {
        socket_io.to(socket.id).emit("400","there is no such user");
        return;
    }
    const to_user = await User.findOne({_id: new mongoose.Types.ObjectId(user)}, UserHidenField).catch(err => console.log("ERROR:", err.message));
    if (!to_user) {
        socket_io.to(socket.id).emit("400","there is no such user");
        return;
    }
    if (to_user.socket_id) {
        socket_io.to(_user.socket_id).emit('1000', {from_user, to_user, msg});
    }
    const message = new Message({
        from_user,
        to_user,
        msg,
    });
    await message.save().catch(err => console.log(err.message));
};

const send_club_message = async (socket, user, msg) => {
    const _user = await User.findOne({_id: new mongoose.Types.ObjectId(user)}).catch(err => console.log("ERROR:", err.message));
    if (!_user) {
        //socket_io
    }
    console.log('message: ', user + "=>" + msg);
};
const broadcast = async (socket, user, msg) => {
    console.log('message: ', user + "=>" + msg);
};

module.exports = {
    init,
    connect,
    disconnect,
    send_dm_message,
    send_club_message,
    broadcast,
}