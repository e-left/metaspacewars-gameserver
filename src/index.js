require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// new user connection
io.on('connection', (socket) => {
  console.log("New user connected");

  // TODO: game start listener
  socket.on("game start", (data) => {

  });

  // TODO: enemy kill listener
  socket.on("enemy kill", (data) => {

  });
  
  // TODO: wave clear listener
  socket.on("wave clear", (data) => {

  });

  // TODO: game end listener
  socket.on("game end", (data) => {

  });
});

// start the server on $PORT, defaults to 3000
server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});