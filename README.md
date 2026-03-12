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
