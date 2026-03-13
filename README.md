# Pokemon Project (Docker + MySQL)

A Pokemon web app that fetches and caches Pokemon data in MySQL. Runs entirely in Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Quick Start

1. Open a terminal in this project folder.

2. **Optional:** Copy `.env.example` to `.env` if you want to change database passwords (defaults work out of the box).

3. Build and run:
   ```bash
   docker compose up --build -d
   ```

4. Open **http://localhost:3000** in your browser.

5. Click a Pokemon (Pikachu, Squirtle, Bulbasaur, or Charmander) to view details. The first visit fetches from PokeAPI and caches in MySQL; later visits load from the database.

6. **Create your own Pokemon:** Click "Your Own Pokemon" to sign up or log in. Draw your Pokemon on the canvas, add stats, and post it to the landing page for everyone to see.

## Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start containers in background |
| `docker compose up --build -d` | Rebuild and start |
| `docker compose down` | Stop and remove containers |
| `docker compose logs -f` | View logs |

## Ports

- **3000** – Web app
- **3307** – MySQL (host port; container uses 3306 internally)

## Environment Variables

See `.env.example`. Default values work for local development. Create a `.env` file to override.

## Custom Pokemon

If you already had the app running before this feature was added, you need the new database tables. Either:

- **Fresh start:** `docker compose down -v` then `docker compose up --build -d` (wipes existing data)
- **Keep data:** Run the migration: `docker compose exec mysql mysql -u root -p pokemon_db < server/migrate-add-users-custom.sql` (use your DB password)

## Auth on Live Website (GitHub Pages)

To make signup/login work on **https://srmonopatin.github.io/pokemon-pokeapi/** (not just locally), deploy the backend to Railway and update `api-config.js`. See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions.
