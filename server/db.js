const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pokemon_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getPokemon(name) {
  const [rows] = await pool.execute(
    'SELECT id, name, description, sprite_url, stats_json, types_json FROM pokemon WHERE name = ?',
    [name.toLowerCase()]
  );
  return rows[0] || null;
}

async function savePokemon(pokemon) {
  const { id, name, description, sprite_url, stats_json, types_json } = pokemon;
  await pool.execute(
    `INSERT INTO pokemon (id, name, description, sprite_url, stats_json, types_json)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       description = VALUES(description),
       sprite_url = VALUES(sprite_url),
       stats_json = VALUES(stats_json),
       types_json = VALUES(types_json),
       updated_at = CURRENT_TIMESTAMP`,
    [id, name.toLowerCase(), description, sprite_url, JSON.stringify(stats_json), JSON.stringify(types_json)]
  );
}

async function createUser(email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email.toLowerCase(), passwordHash]
  );
  return result.insertId;
}

async function getUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, email FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function saveCustomPokemon(data) {
  const { userId, name, description, sprite_data, stats_json, types_json } = data;
  const [result] = await pool.execute(
    `INSERT INTO custom_pokemon (user_id, name, description, sprite_data, stats_json, types_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, description || '', sprite_data || null, JSON.stringify(stats_json || []), JSON.stringify(types_json || [])]
  );
  return result.insertId;
}

async function getCustomPokemonById(id) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, name, description, sprite_data, stats_json, types_json, created_at FROM custom_pokemon WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function getAllCustomPokemon() {
  const [rows] = await pool.execute(
    'SELECT id, name, description, sprite_data, stats_json, types_json, created_at FROM custom_pokemon ORDER BY created_at DESC'
  );
  return rows;
}

module.exports = {
  pool,
  getPokemon,
  savePokemon,
  createUser,
  getUserByEmail,
  getUserById,
  saveCustomPokemon,
  getCustomPokemonById,
  getAllCustomPokemon,
};
