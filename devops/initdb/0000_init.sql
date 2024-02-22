CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS notes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    title VARCHAR(255) NOT NULL,
    publishedToken uuid,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS user_shard_locations (
    user_id uuid NOT NULL PRIMARY KEY,
    shard_id INTEGER NOT NULL
);

CREATE INDEX notes_user_id_idx ON notes (user_id);