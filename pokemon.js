(function () {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('content');

  const allowedNames = ['pikachu', 'squirtle', 'charmander', 'bulbasaur'];

  function showLoading() {
    loadingEl.hidden = false;
    errorEl.hidden = true;
    contentEl.hidden = true;
  }

  function showError() {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    contentEl.hidden = true;
  }

  function showContent() {
    loadingEl.hidden = true;
    errorEl.hidden = true;
    contentEl.hidden = false;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatStatName(statName) {
    const map = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed'
    };
    return map[statName] || statName;
  }

  function render(data) {
    document.getElementById('pokemon-name').textContent = capitalize(data.name);
    document.getElementById('pokemon-sprite').src = data.sprites.front_default;
    document.getElementById('pokemon-sprite').alt = data.name;

    document.getElementById('pokemon-height').textContent = data.height / 10 + ' m';
    document.getElementById('pokemon-weight').textContent = data.weight / 10 + ' kg';
    document.getElementById('pokemon-types').textContent = data.types
      .map(function (t) { return capitalize(t.type.name); })
      .join(', ');

    const tbody = document.getElementById('stats-body');
    tbody.innerHTML = '';

    data.stats.forEach(function (s) {
      const row = document.createElement('tr');
      row.innerHTML =
        '<td>' + formatStatName(s.stat.name) + '</td>' +
        '<td>' + s.base_stat + '</td>';
      tbody.appendChild(row);
    });

    showContent();
  }

  if (!name || !allowedNames.includes(name)) {
    showError();
    return;
  }

  showLoading();

  fetch('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(name))
    .then(function (res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(render)
    .catch(function () {
      showError();
    });
})();
