const ALLOWED = ['pikachu', 'squirtle', 'bulbasaur', 'charmander'];
const API_BASE = 'https://pokeapi.co/api/v2';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}

function getDescription(species) {
  const entry = species.flavor_text_entries?.find(
    (e) => e.language?.name === 'en'
  );
  if (!entry) return 'No description available.';
  return entry.flavor_text.replace(/\n|\f/g, ' ').trim();
}

async function fetchPokemon(name) {
  const res = await fetch(`${API_BASE}/pokemon/${name}`);
  if (!res.ok) throw new Error('Pokemon not found');
  return res.json();
}

async function fetchSpecies(id) {
  const res = await fetch(`${API_BASE}/pokemon-species/${id}`);
  if (!res.ok) throw new Error('Species not found');
  return res.json();
}

function render(pokemon, species) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const detail = document.getElementById('pokemon-detail');

  hide(loading);
  hide(error);
  show(detail);

  const sprite =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  document.getElementById('pokemon-name').textContent =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  document.title = `${pokemon.name} | Pokemon`;

  const typesEl = document.getElementById('pokemon-types');
  typesEl.innerHTML = '';
  (pokemon.types || []).forEach((t) => {
    const span = document.createElement('span');
    span.className = 'type-badge';
    span.textContent = t.type?.name || t;
    typesEl.appendChild(span);
  });

  const img = document.getElementById('pokemon-sprite');
  img.src = sprite || '';
  img.alt = pokemon.name;

  document.getElementById('pokemon-description').textContent = getDescription(
    species
  );

  const tbody = document.querySelector('#pokemon-stats tbody');
  tbody.innerHTML = '';
  (pokemon.stats || []).forEach((s) => {
    const row = document.createElement('tr');
    const statName = (s.stat?.name || '').replace(/-/g, ' ');
    row.innerHTML = `<th>${statName}</th><td>${s.base_stat ?? ''}</td>`;
    tbody.appendChild(row);
  });
}

function showError(msg) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const detail = document.getElementById('pokemon-detail');

  hide(loading);
  hide(detail);
  show(error);
  error.textContent = msg;
}

async function init() {
  const name = getQueryParam('name')?.toLowerCase();

  if (!name || !ALLOWED.includes(name)) {
    showError('Invalid Pokemon. Redirecting...');
    setTimeout(() => (window.location.href = 'index.html'), 1500);
    return;
  }

  try {
    const [pokemon, species] = await Promise.all([
      fetchPokemon(name),
      fetchPokemon(name).then((p) => fetchSpecies(p.id)),
    ]);
    render(pokemon, species);
  } catch (err) {
    showError(err.message || 'Failed to load Pokemon.');
  }
}

init();
