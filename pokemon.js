const ALLOWED = ['pikachu', 'squirtle', 'bulbasaur', 'charmander'];
const POKEAPI = 'https://pokeapi.co/api/v2';

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
  const entry = species?.flavor_text_entries?.find((e) => e.language?.name === 'en');
  if (!entry) return 'No description available.';
  return entry.flavor_text.replace(/\n|\f/g, ' ').trim();
}

async function fetchPokemon(name) {
  const pokemonRes = await fetch(`${POKEAPI}/pokemon/${name}`);
  if (!pokemonRes.ok) throw new Error('Pokemon not found');
  const pokemon = await pokemonRes.json();

  const speciesRes = await fetch(`${POKEAPI}/pokemon-species/${pokemon.id}`);
  const species = speciesRes.ok ? await speciesRes.json() : {};

  const sprite =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  return {
    name: pokemon.name,
    description: getDescription(species),
    sprite_url: sprite,
    stats: (pokemon.stats || []).map((s) => ({
      name: s.stat?.name || '',
      base_stat: s.base_stat ?? 0,
    })),
    types: (pokemon.types || []).map((t) => ({
      name: t.type?.name || t,
    })),
  };
}

function render(data) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const detail = document.getElementById('pokemon-detail');

  hide(loading);
  hide(error);
  show(detail);

  document.getElementById('pokemon-name').textContent =
    data.name.charAt(0).toUpperCase() + data.name.slice(1);
  document.title = `${data.name} | Pokemon`;

  const typesEl = document.getElementById('pokemon-types');
  typesEl.innerHTML = '';
  (data.types || []).forEach((t) => {
    const span = document.createElement('span');
    span.className = 'type-badge';
    span.textContent = t.name || t;
    typesEl.appendChild(span);
  });

  const img = document.getElementById('pokemon-sprite');
  img.src = data.sprite_url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  img.alt = data.name;
  img.style.display = data.sprite_url ? 'block' : 'none';

  document.getElementById('pokemon-description').textContent =
    data.description || 'No description available.';

  const tbody = document.querySelector('#pokemon-stats tbody');
  tbody.innerHTML = '';
  (data.stats || []).forEach((s) => {
    const row = document.createElement('tr');
    const statName = (s.name || '').replace(/-/g, ' ');
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

async function fetchCustomPokemon(id) {
  const res = await window.api.fetch(`/api/custom-pokemon/${id}`);
  if (!res.ok) throw new Error('Custom Pokemon not found');
  const data = await res.json();
  return {
    name: data.name,
    description: data.description || 'No description available.',
    sprite_url: data.sprite_data || '',
    stats: data.stats || [],
    types: data.types || [],
  };
}

async function init() {
  const customId = getQueryParam('custom');
  const name = getQueryParam('name')?.toLowerCase();

  if (customId) {
    try {
      const data = await fetchCustomPokemon(customId);
      render(data);
    } catch (err) {
      showError(err.message || 'Failed to load Pokemon.');
    }
    return;
  }

  if (!name || !ALLOWED.includes(name)) {
    showError('Invalid Pokemon. Redirecting...');
    setTimeout(() => (window.location.href = 'index.html'), 1500);
    return;
  }

  try {
    const data = await fetchPokemon(name);
    render(data);
  } catch (err) {
    showError(err.message || 'Failed to load Pokemon.');
  }
}

init();
