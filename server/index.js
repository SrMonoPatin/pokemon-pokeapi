require('dotenv').config();
const express = require('express');
const path = require('path');
const { getPokemon, savePokemon } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
