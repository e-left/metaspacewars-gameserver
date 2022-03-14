require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const { createPlayer, getPlayers, readPlayer, updatePlayer, deletePlayer, getLeaderboard, getRanking, getCount } = require('./data.js');
const { EnemiesPerWave, WavesPerLive, PointsPerEnemy, PointsPerWave, LivesPointMultiplier } = require('./constants');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

// TODO: mitigate on redis possibly?
const inMemoryPlayers = {};

// new user connection
// TODO: save in metadata the skin selection, make sure to validate it
io.on('connection', (socket) => {
  console.log("New user connected");

  // game start listener
  socket.on("game start", (data) => {
    // data = {
    //   "pubkey"
    // }
    const pubkey = data.pubkey;

    // creates a new game IN MEMORY to be tracked
    // through a global hashmap (object)
    const gameID = uuidv4();
    let player = {
      pubkey: pubkey,
      highscore: 0,
      metadata: {
        enemiesKilled: 0,
        wave: 1,
        lives: 1,
        cheat: false,
      },
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

  // enemy kill listener
  socket.on("enemy kill", (data) => {
    // data = {
    //   "pubkey",
    //   "gameID"
    // }
    const pubkey = data.pubkey;
    const gameID = data.gameID;
    let done = false;

    // ensure here proper wave limits
    // TODO: maybe add rate limits?
    let valid = false;
    let currentWaveEnemiesKilled = inMemoryPlayers[gameID].metadata.enemiesKilled - EnemiesPerWave * (inMemoryPlayers[gameID].metadata.wave - 1);

    if (currentWaveEnemiesKilled <= EnemiesPerWave && inMemoryPlayers[gameID].metadata.lives > 0) {
      valid = true;
    } else {
      inMemoryPlayers[gameID].metadata.cheat = true;
    }

    // add enemy kill
    if (valid && inMemoryPlayers[gameID].pubkey === pubkey) {
      inMemoryPlayers[gameID].metadata.enemiesKilled += 1;
      done = true;
      // add score according to calculation here
      inMemoryPlayers[gameID].highscore += PointsPerEnemy;
    };

    // returnedObject = {
    //   "pubkey",
    //   "gameID",
    //   "score",
    //   "valid",
    //   "done"
    // }
    return {
      pubkey: pubkey,
      gameID: gameID,
      score: inMemoryPlayers[gameID].highscore,
      valid: valid,
      done: done,
    };
  });

  // wave clear listener
  socket.on("wave clear", (data) => {
    // data = {
    //   "pubKey",
    //   "gameID"
    // }
    const pubkey = data.pubkey;
    const gameID = data.gameID;
    let done = false;

    // ensure here wave limits of enemies
    // TODO: maybe add rate limits?
    let valid = false;
    let currentWaveEnemiesKilled = inMemoryPlayers[gameID].metadata.enemiesKilled - EnemiesPerWave * (inMemoryPlayers[gameID].metadata.wave - 1);

    if (currentWaveEnemiesKilled === EnemiesPerWave && inMemoryPlayers[gameID].metadata.lives > 0) {
      valid = true;
    } else {
      inMemoryPlayers[gameID].metadata.cheat = true;
    }

    // add wave clear with lives
    if (valid && inMemoryPlayers[gameID].pubkey === pubkey) {
      inMemoryPlayers[gameID].metadata.wave += 1;
      done = true;
      // add score according to calculation here
      inMemoryPlayers[gameID].highscore += PointsPerWave + PointsPerWave * (inMemoryPlayers[gameID].metadata.lives - 1) * (LivesPointMultiplier - 1);

      // add live if in specified wave
      if (inMemoryPlayers[gameID].metadata.wave % WavesPerLive === 0) {
        inMemoryPlayers[gameID].metadata.lives += 1;
      }
    };


    // returnedObject = {
    //   "pubkey",
    //   "gameID",
    //   "score",
    //   "valid",
    //   "done"
    // }
    return {
      pubkey: pubkey,
      gameID: gameID,
      score: inMemoryPlayers[gameID].highscore,
      valid: valid,
      done: done,
    };

  });

  // game end listener
  socket.on("game end", async (data) => {
    // data = {
    //   "pubKey",
    //   "gameID"
    // }
    const pubkey = data.pubkey;
    const gameID = data.gameID;
    let done = false;
    let valid = false;

    // ensure valid game
    // ensure lives are zero
    // ensure no cheating
    // ensure enemies are less than (or equal, edge case with fired bullet) wave enemies (since we die mid-wave)
    if(inMemoryPlayers[gameID].metadata.lives === 0 && !inMemoryPlayers.metadata.cheat && (inMemoryPlayers[gameID].metadata.enemiesKilled - (EnemiesPerWave * inMemoryPlayers[gameID].metadata.wave - 1)) <= EnemiesPerWave) {
      valid = true;
    }

    // write to database
    // TODO: save in metadata skins used
    // no new validation needed, since it was validated upon game creation
    let newEntry;
    if(valid) {
      newEntry = await createPlayer(inMemoryPlayers[gameID]);
      done = true;
    }

    // delete the in memory entry
    delete inMemoryPlayers[gameID];

    // returnedObject = {
    //   "pubKey",
    //   "gameID",
    //   "score",
    //   "valid",
    //   "done"
    // }
    return {
      pubkey: pubkey,
      gameID: gameID,
      score: done ? newEntry.highscore : 0,
      valid: valid,
      done: done,
    };
  });
});

// handler for the leaderboard to be returned
app.get("/leaderboard/:count/:offset", async (req, res) => {
  // get leaderboard as JSON
  const count = req.query.count;
  const offset = req.query.offset;

  const leaderboard = await getLeaderboard(count, offset);
  if (leaderboard.error) {
    res.status(400).send("Invalid offset!");
  }

  // return the JSON
  res.status(200).json(leaderboard);
});

// handler for user statistics to be returned
app.get("/player/:id", async (req, res) => {
  const id = req.query.id;

  const player = await readPlayer(id);

  res.status(200).json(player);
});

// start the server on $PORT, defaults to 3000
server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});