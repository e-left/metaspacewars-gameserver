require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const {createPlayer, getPlayers, readPlayer, updatePlayer, deletePlayer, getLeaderboard, getRanking, getCount} = require('./data.js');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

// TODO: mitigate on redis possibly?
const inMemoryPlayers = {};

// new user connection
io.on('connection', (socket) => {
  console.log("New user connected");

  // TODO: game start listener
  socket.on("game start", (data) => {
    // data = {
    //   "pubkey"
    // }

    // creates a new game IN MEMORY to be tracked
    // through a global hashmap (object)
    const gameID = uuidv4();
    let player = {
      pubkey: data.pubkey,
      highscore: 0,
      metadata: {},
    };

    inMemoryPlayers[gameID] = player;

    // returnedObject = {
    //   "pubkey",
    //   "gameID"
    // }
    return {
      pubkey: player.pubkey,
      gameID: gameID
    };
  
  });

  // TODO: enemy kill listener
  socket.on("enemy kill", (data) => {
    // data = {
    //   "pubkey",
    //   "gameID"
    // }

    // ensure here proper rate limiting and wave limits

    // add enemy kill

    // returnedObject = {
    //   "pubkey",
    //   "gameID"
    // }

  });
  
  // TODO: wave clear listener
  socket.on("wave clear", (data) => {
    // data = {
    //   "pubKey",
    //   "gameID"
    // }

    // ensure here wave limits of enemies

    // add wave clear with lives

    // returnedObject = {
    //   "pubKey",
    //   "gameID"
    // }

  });

  // TODO: game end listener
  socket.on("game end", (data) => {
    // data = {
    //   "pubKey",
    //   "gameID"
    // }

    // ensure valid game

    // write to database

    // returnedObject = {
    //   "pubKey",
    //   "gameID"
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