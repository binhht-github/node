var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/home", function(req, res, next) {
  res.sendFile(__dirname + "/public/views/chat.html");
});

app.use('/login', require('./public/views/login.html'));



//======================================
const botName = 'CHAT BOX';
io.on('connection', socket => {
  console.log(socket);
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));






// const path = require('path');
// const http = require('http');
// const express = require('express');
// const socketio = require('socket.io');
// var fs = require("fs");
// const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

// http.createServer((request, response) => {
//     fs.readFile('public/chat.html',function(err,data){
//         response.writeHead(200,{'content-Type':'text/html'});
//         response.write(data);
//         response.end();
//     });
// }).listen(8000);
// console.log("starting server....");
