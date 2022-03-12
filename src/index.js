const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// if we ever need a server connection to validate things
// app.get('/', (req, res) => {
//   res.send("hello!");
// });

// user has connected
io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});