// server/routes/tournaments.js
const express = require('express');

module.exports = ({ db }) => {
  const router = express.Router();
  router.get('/', (req, res) => {
    res.json(db.listTournaments());
  });
  router.post('/', (req, res) => {
    const body = req.body;
    if (!body.name || !body.starts_at) return res.status(400).json({ error: 'Missing fields' });
    db.createTournament(body);
    res.status(201).json({ ok: true });
  });
  return router;
};