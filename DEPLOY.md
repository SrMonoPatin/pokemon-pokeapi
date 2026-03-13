# Deploy Auth to Work on Live Website (GitHub Pages)

To make signup, login, and custom Pokemon work on **https://srmonopatin.github.io/pokemon-pokeapi/** (not just locally), deploy the backend to Railway.

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → select `pokemon-pokeapi`.
3. Railway will detect the Node.js app. Add a **MySQL** database:
   - Click **+ New** → **Database** → **MySQL**.
   - Railway will create a MySQL instance and set `MYSQL_URL` or `DATABASE_URL` automatically.
4. In your **Web Service** settings, add variables (if not auto-linked):
   - `JWT_SECRET` – a random secret string (e.g. run `openssl rand -hex 32` to generate)
   - `SESSION_SECRET` – same or another random string
5. Link the MySQL database to the web service (Railway usually does this automatically and sets `MYSQL_URL` or `DATABASE_URL`).
6. Deploy. Railway will give you a URL like `https://pokemon-pokeapi-production.up.railway.app`. Copy it.

## Step 2: Update Frontend API URL

1. Open `api-config.js` in this repo.
2. Set `API_BASE` to your Railway URL (no trailing slash):
   ```javascript
   var API_BASE = 'https://pokemon-pokeapi-production.up.railway.app';
   ```
3. Commit and push to GitHub. GitHub Pages will rebuild with the new config.

## Step 3: Add CORS Origin (if needed)

Railway’s backend already allows `https://srmonopatin.github.io`. If you use a custom domain, add it to the `cors` config in `server/index.js`.

---

## Result

- **Live site:** https://srmonopatin.github.io/pokemon-pokeapi/
- Signup, login, and custom Pokemon will work from the live site.
- Local Docker (`docker compose up`) still works with `API_BASE = ''`.
