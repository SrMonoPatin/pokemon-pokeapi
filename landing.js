async function loadCustomPokemon() {
  try {
    const res = await window.api.fetch('/api/custom-pokemon');
    if (!res.ok) return;
    const list = await res.json();
    const grid = document.getElementById('custom-pokemon-grid');
    if (!grid || !list.length) return;

    list.forEach((p) => {
      const a = document.createElement('a');
      a.href = `pokemon.html?custom=${p.id}`;
      a.className = 'pokemon-card pokemon-card-custom';
      a.dataset.type = 'custom';
      const typeLabel = (p.types || []).map((t) => t.name || t).join(', ') || 'Custom';
      const imgHtml = p.sprite_data
        ? `<img src="${p.sprite_data}" alt="${escapeHtml(p.name)}">`
        : `<div class="custom-placeholder">?</div>`;
      a.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-inner">
          ${imgHtml}
          <span class="pokemon-name">${escapeHtml(p.name)}</span>
          <span class="pokemon-type-label">${escapeHtml(typeLabel)}</span>
        </div>
      `;
      grid.appendChild(a);
    });
  } catch {
    // No backend (e.g. GitHub Pages) - silently skip
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

loadCustomPokemon();
