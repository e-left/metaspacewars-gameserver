require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

// new user connection
io.on('connection', (socket) => {
  console.log("New user connected");

  // TODO: game start listener
  socket.on("game start", (data) => {
    // data = {
    //   "publicKey"
    // }

    // creates a new game IN MEMORY to be tracked
    // through a global hashmap (object)

    // returnedObject = {
    //   "publicKey",
    //   "gameId"
    // }
  
  });

  // TODO: enemy kill listener
  socket.on("enemy kill", (data) => {
    // data = {
    //   "publicKey",
    //   "gameId"
    // }

    // ensure here proper rate limiting and wave limits

    // add enemy kill

    // returnedObject = {
    //   "publicKey",
    //   "gameId"
    // }

  });
  
  // TODO: wave clear listener
  socket.on("wave clear", (data) => {
    // data = {
    //   "publicKey",
    //   "gameId"
    // }

    // ensure here wave limits of enemies

    // add wave clear with lives

    // returnedObject = {
    //   "publicKey",
    //   "gameId"
    // }

  });

  // TODO: game end listener
  socket.on("game end", (data) => {
    // data = {
    //   "publicKey",
    //   "gameId"
    // }

    // ensure valid game

    // write to database

    // returnedObject = {
    //   "publicKey",
    //   "gameId"
    // }

  });
});

// handler for the leaderboard to be returned
// TODO: implement this
app.get("/leaderboard", (req, res) => {
  // get leaderboard as JSON

  // return the JSON

});

// handler for user statistics to be returned
// TODO: implement this
app.get("/user/:id", (req, res) => {

});

// start the server on $PORT, defaults to 3000
server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});