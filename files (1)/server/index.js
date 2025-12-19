// server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');
const db = require('./db');
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_secure_secret';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes({ db, bcrypt, jwt, JWT_SECRET }));
app.use('/api/tournaments', tournamentRoutes({ db }));

// Simple leaderboard socket channel
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join:arena', (user) => {
    socket.join('arena');
  });
  socket.on('match:result', (payload) => {
    // payload: { userId, score, xp }
    db.recordMatchResult(payload);
    io.to('arena').emit('leaderboard:update', db.getTopPlayers(20));
  });
  socket.on('disconnect', () => {});
});

// REST: basic profile
app.get('/api/profile/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const p = db.getPlayerById(id);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  res.json(p);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));