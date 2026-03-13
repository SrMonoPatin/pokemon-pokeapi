(function () {
  const API_BASE = typeof API_BASE !== 'undefined' ? API_BASE : '';
  const TOKEN_KEY = 'pokemon_token';

  window.api = {
    url(path) {
      return API_BASE ? API_BASE.replace(/\/$/, '') + path : path;
    },
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token) {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    },
    headers(includeAuth = false) {
      const h = { 'Content-Type': 'application/json' };
      const token = this.getToken();
      if (includeAuth && token) h['Authorization'] = 'Bearer ' + token;
      return h;
    },
    fetch(path, options = {}) {
      const url = this.url(path);
      const { auth, ...fetchOpts } = options;
      const headers = { ...this.headers(auth), ...(options.headers || {}) };
      return fetch(url, { ...fetchOpts, headers, credentials: 'include' });
    },
  };
})();
