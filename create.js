const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentColor = '#000000';

// Fill canvas with white background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Color palette
document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
  });
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', () => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Drawing
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.moveTo(x, y);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  ctx.lineTo(x, y);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseleave', () => (isDrawing = false));

// Touch support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
  canvas.dispatchEvent(mouseEvent);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
  canvas.dispatchEvent(mouseEvent);
});
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  canvas.dispatchEvent(new MouseEvent('mouseup'));
});

// Auth check and redirect
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = 'login.html?next=create.html';
      return false;
    }
    return true;
  } catch {
    window.location.href = 'login.html?next=create.html';
    return false;
  }
}

// Logout
document.getElementById('logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'index.html';
});

// Form submit
document.getElementById('stats-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('create-error');
  errorEl.classList.add('hidden');

  const name = document.getElementById('pokemon-name').value.trim();
  const description = document.getElementById('pokemon-description').value.trim();
  const types = Array.from(document.querySelectorAll('input[name="type"]:checked')).map((c) => c.value);

  const stats = [
    { name: 'hp', base_stat: parseInt(document.getElementById('hp').value, 10) || 0 },
    { name: 'attack', base_stat: parseInt(document.getElementById('attack').value, 10) || 0 },
    { name: 'defense', base_stat: parseInt(document.getElementById('defense').value, 10) || 0 },
    { name: 'special-attack', base_stat: parseInt(document.getElementById('special-attack').value, 10) || 0 },
    { name: 'special-defense', base_stat: parseInt(document.getElementById('special-defense').value, 10) || 0 },
    { name: 'speed', base_stat: parseInt(document.getElementById('speed').value, 10) || 0 },
  ];

  const sprite_data = canvas.toDataURL('image/png');

  try {
    const res = await fetch('/api/custom-pokemon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        description,
        sprite_data,
        stats_json: stats,
        types_json: types.map((t) => ({ name: t })),
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      errorEl.textContent = data.error || 'Failed to save';
      errorEl.classList.remove('hidden');
      return;
    }
    window.location.href = `pokemon.html?custom=${data.id}`;
  } catch (err) {
    errorEl.textContent = 'Network error. Make sure the server is running.';
    errorEl.classList.remove('hidden');
  }
});

// Init
checkAuth();
