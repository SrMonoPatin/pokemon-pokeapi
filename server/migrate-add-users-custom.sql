-- Run this if you have an existing database and need the new tables.
-- Option 1: docker-compose exec mysql mysql -u root -p pokemon_db < server/migrate-add-users-custom.sql
-- Option 2: docker-compose down -v && docker-compose up (wipes data, recreates everything)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_pokemon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sprite_data LONGTEXT,
  stats_json JSON,
  types_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
