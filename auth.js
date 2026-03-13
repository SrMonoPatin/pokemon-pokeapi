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
  const path = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const res = await window.api.fetch(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || (res.status === 500 ? 'Server error. Check DEPLOY.md for live setup.' : 'Something went wrong');
        showError(errorEl, msg);
        return;
      }
      if (data.token) window.api.setToken(data.token);
      window.location.href = redirectTo;
    } catch (err) {
      showError(errorEl, 'Network error. Is the backend running? See DEPLOY.md for live setup.');
    }
  });
}
