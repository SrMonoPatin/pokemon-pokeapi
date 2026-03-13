require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {
  ensureAuthTables,
  getPokemon,
  savePokemon,
  createUser,
  getUserByEmail,
  getUserById,
  saveCustomPokemon,
  getCustomPokemonById,
  getAllCustomPokemon,
} = require('./db');
const { hashPassword, verifyPassword, signToken, verifyToken, requireAuth } = require('./auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const SESSION_SECRET = process.env.SESSION_SECRET || 'pokemon-secret-change-in-production';

app.use(express.json());
const corsOrigins = [
  'https://srmonopatin.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean);
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(express.static(path.join(__dirname, '..')));

function getDescription(species) {
  const entry = species?.flavor_text_entries?.find((e) => e.language?.name === 'en');
  if (!entry) return 'No description available.';
  return entry.flavor_text.replace(/\n|\f/g, ' ').trim();
}

app.get('/api/pokemon/:name', async (req, res) => {
  const name = req.params.name?.toLowerCase();
  if (!name) {
    return res.status(400).json({ error: 'Pokemon name required' });
  }

  try {
    let data = await getPokemon(name);

    if (!data) {
      const pokemonRes = await fetch(`${POKEAPI_BASE}/pokemon/${name}`);
      if (!pokemonRes.ok) {
        return res.status(404).json({ error: 'Pokemon not found' });
      }
      const pokemon = await pokemonRes.json();

      const speciesRes = await fetch(`${POKEAPI_BASE}/pokemon-species/${pokemon.id}`);
      const species = speciesRes.ok ? await speciesRes.json() : {};

      const sprite =
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        pokemon.sprites?.front_default;
      const description = getDescription(species);
      const stats = (pokemon.stats || []).map((s) => ({
        name: s.stat?.name || '',
        base_stat: s.base_stat ?? 0,
      }));
      const types = (pokemon.types || []).map((t) => ({
        name: t.type?.name || t,
      }));

      data = {
        id: pokemon.id,
        name: pokemon.name,
        description,
        sprite_url: sprite,
        stats,
        types,
      };

      await savePokemon({
        id: data.id,
        name: data.name,
        description: data.description,
        sprite_url: data.sprite_url,
        stats_json: data.stats,
        types_json: data.types,
      });
    } else {
      data = {
        name: data.name,
        description: data.description,
        sprite_url: data.sprite_url,
        stats: typeof data.stats_json === 'string' ? JSON.parse(data.stats_json) : data.stats_json,
        types: (typeof data.types_json === 'string' ? JSON.parse(data.types_json) : data.types_json).map((t) =>
          typeof t === 'string' ? { name: t } : { name: t.name || t }
        ),
      };
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to load Pokemon' });
  }
});

// Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const passwordHash = await hashPassword(password);
    const userId = await createUser(email, passwordHash);
    req.session.userId = userId;
    req.session.email = email;
    const token = signToken(userId, email);
    res.json({ email, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    req.session.userId = user.id;
    req.session.email = user.email;
    const token = signToken(user.id, user.email);
    res.json({ email: user.email, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    const payload = verifyToken(token);
    if (payload) return res.json({ email: payload.email });
  }
  if (req.session?.userId) return res.json({ email: req.session.email });
  return res.status(401).json({ error: 'Not authenticated' });
});

// Custom Pokemon
app.get('/api/custom-pokemon', async (req, res) => {
  try {
    const list = await getAllCustomPokemon();
    const formatted = list.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      sprite_data: row.sprite_data,
      stats: typeof row.stats_json === 'string' ? JSON.parse(row.stats_json) : row.stats_json,
      types: (typeof row.types_json === 'string' ? JSON.parse(row.types_json) : row.types_json).map((t) =>
        typeof t === 'string' ? { name: t } : { name: t.name || t }
      ),
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to load custom Pokemon' });
  }
});

app.get('/api/custom-pokemon/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const row = await getCustomPokemonById(id);
    if (!row) return res.status(404).json({ error: 'Custom Pokemon not found' });
    res.json({
      id: row.id,
      name: row.name,
      description: row.description,
      sprite_data: row.sprite_data,
      stats: typeof row.stats_json === 'string' ? JSON.parse(row.stats_json) : row.stats_json,
      types: (typeof row.types_json === 'string' ? JSON.parse(row.types_json) : row.types_json).map((t) =>
        typeof t === 'string' ? { name: t } : { name: t.name || t }
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to load custom Pokemon' });
  }
});

app.post('/api/custom-pokemon', requireAuth, async (req, res) => {
  try {
    const { name, description, sprite_data, stats_json, types_json } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name required' });
    }
    const userId = req.userId || req.session?.userId;
    const id = await saveCustomPokemon({
      userId,
      name: name.trim(),
      description: description || '',
      sprite_data: sprite_data || null,
      stats_json: stats_json || [],
      types_json: types_json || [],
    });
    res.json({ id, name: name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to save custom Pokemon' });
  }
});

async function start() {
  try {
    await ensureAuthTables();
    console.log('Auth tables ready');
  } catch (err) {
    console.error('Failed to ensure auth tables:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
