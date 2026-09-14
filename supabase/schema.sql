-- Supabase PostgreSQL Schema for Ribolov BiH MVP

CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    publisher VARCHAR(255),
    url TEXT,
    verified_at DATE,
    confidence VARCHAR(32) DEFAULT 'medium',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS fish_species (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name_bs VARCHAR(128) NOT NULL,
    scientific_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    habitat JSONB DEFAULT '[]'::jsonb,
    temperature_min NUMERIC(4, 1),
    temperature_optimal_min NUMERIC(4, 1),
    temperature_optimal_max NUMERIC(4, 1),
    temperature_max NUMERIC(4, 1),
    best_times JSONB DEFAULT '[]'::jsonb,
    seasons JSONB DEFAULT '[]'::jsonb,
    weather_preferences JSONB DEFAULT '{}'::jsonb,
    baits JSONB DEFAULT '[]'::jsonb,
    methods JSONB DEFAULT '[]'::jsonb,
    source_id VARCHAR(64) REFERENCES sources(id),
    confidence VARCHAR(32) DEFAULT 'high',
    last_verified DATE
);

CREATE TABLE IF NOT EXISTS water_bodies (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    municipality VARCHAR(128),
    city VARCHAR(128),
    region VARCHAR(128),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    description TEXT,
    manager VARCHAR(255),
    fishing_rules_url TEXT,
    permit_url TEXT,
    source_id VARCHAR(64) REFERENCES sources(id)
);

CREATE TABLE IF NOT EXISTS fish_water_relations (
    id SERIAL PRIMARY KEY,
    fish_id VARCHAR(64) REFERENCES fish_species(id) ON DELETE CASCADE,
    water_body_id VARCHAR(64) REFERENCES water_bodies(id) ON DELETE CASCADE,
    presence_level VARCHAR(32) DEFAULT 'medium',
    confidence VARCHAR(32) DEFAULT 'high',
    notes TEXT,
    source_id VARCHAR(64) REFERENCES sources(id)
);

CREATE TABLE IF NOT EXISTS fishing_rules (
    id SERIAL PRIMARY KEY,
    fish_id VARCHAR(64) REFERENCES fish_species(id) ON DELETE CASCADE,
    min_length_cm INT,
    closed_season VARCHAR(128),
    daily_limit VARCHAR(128),
    source_id VARCHAR(64) REFERENCES sources(id),
    notes TEXT
);
