const ALLOWED = ['pikachu', 'squirtle', 'bulbasaur', 'charmander'];

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

async function fetchPokemon(name) {
  const res = await fetch(`/api/pokemon/${name}`);
  if (!res.ok) throw new Error('Pokemon not found');
  return res.json();
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
  img.src = data.sprite_url || '';
  img.alt = data.name;

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

async function init() {
  const name = getQueryParam('name')?.toLowerCase();

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
