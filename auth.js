function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(el) {
  el.classList.add('hidden');
}

function initAuth(mode, redirectTo) {
  const form = document.getElementById(mode === 'login' ? 'login-form' : 'signup-form');
  const errorEl = document.getElementById('auth-error');
  const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || (res.status === 500 ? 'Server error. Try running with Docker.' : 'Something went wrong');
        showError(errorEl, msg);
        return;
      }
      window.location.href = redirectTo;
    } catch (err) {
      showError(errorEl, 'Network error. Make sure Docker is running (docker compose up).');
    }
  });
}
