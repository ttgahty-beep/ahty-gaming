// server/routes/auth.js
const express = require('express');

module.exports = ({ db, bcrypt, jwt, JWT_SECRET }) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing' });
    const existing = db.findUserByUsername(username);
    if (existing) return res.status(400).json({ error: 'Username taken' });
    const hashed = await bcrypt.hash(password, 10);
    db.createUser(username, hashed);
    const user = db.findUserByUsername(username);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = db.findUserByUsername(username);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, level: user.level, xp: user.xp, currency: user.currency } });
  });

  return router;
};