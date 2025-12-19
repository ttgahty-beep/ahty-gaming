// server/db.js
const Database = require('better-sqlite3');
const db = new Database('nexa.db');

function init() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      currency INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      score INTEGER,
      xp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      starts_at DATETIME,
      ends_at DATETIME,
      entry_fee INTEGER DEFAULT 0,
      data JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();
}

init();

module.exports = {
  createUser: (username, hashedPassword) =>
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword),

  findUserByUsername: (username) =>
    db.prepare('SELECT id, username, password, level, xp, currency FROM users WHERE username = ?').get(username),

  getPlayerById: (id) =>
    db.prepare('SELECT id, username, level, xp, currency, created_at FROM users WHERE id = ?').get(id),

  recordMatchResult: ({ userId, score, xp }) => {
    db.prepare('INSERT INTO matches (user_id, score, xp) VALUES (?, ?, ?)').run(userId, score, xp);
    db.prepare('UPDATE users SET xp = xp + ?, currency = currency + ? WHERE id = ?').run(xp, Math.floor(score / 10), userId);
    // level up logic (example)
    const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(userId);
    while (user.xp >= user.level * 1000) {
      user.xp -= user.level * 1000;
      user.level += 1;
    }
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(user.xp, user.level, userId);
  },

  getTopPlayers: (limit = 10) =>
    db.prepare('SELECT id, username, level, xp, currency FROM users ORDER BY level DESC, xp DESC LIMIT ?').all(limit),

  listTournaments: () => db.prepare('SELECT * FROM tournaments ORDER BY starts_at DESC').all(),
  createTournament: (t) => db.prepare('INSERT INTO tournaments (name, starts_at, ends_at, entry_fee, data) VALUES (?, ?, ?, ?, ?)').run(t.name, t.starts_at, t.ends_at, t.entry_fee || 0, JSON.stringify(t.data || {}))
};