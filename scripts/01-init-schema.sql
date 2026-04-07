-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player stats and game state
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  total_kills INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Player bases
CREATE TABLE IF NOT EXISTS bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  x_coord INT NOT NULL,
  y_coord INT NOT NULL,
  health INT DEFAULT 1000,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player resources
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  money INT DEFAULT 10000,
  steel INT DEFAULT 5000,
  oil INT DEFAULT 5000,
  electronics INT DEFAULT 2000,
  manpower INT DEFAULT 1000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id)
);

-- Military units
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  base_id UUID REFERENCES bases(id) ON DELETE CASCADE,
  unit_type VARCHAR(50) NOT NULL, -- Infantry, Tank, Helicopter, Battleship, etc
  quantity INT NOT NULL DEFAULT 1,
  health INT NOT NULL DEFAULT 100,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research technologies
CREATE TABLE IF NOT EXISTS research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tech_name VARCHAR(100) NOT NULL,
  level INT DEFAULT 1,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alliances
CREATE TABLE IF NOT EXISTS alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  leader_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alliance members
CREATE TABLE IF NOT EXISTS alliance_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(alliance_id, player_id)
);

-- Game battle logs
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  defender_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  attacker_base_id UUID REFERENCES bases(id) ON DELETE SET NULL,
  defender_base_id UUID REFERENCES bases(id) ON DELETE SET NULL,
  attacker_losses INT DEFAULT 0,
  defender_losses INT DEFAULT 0,
  outcome VARCHAR(20), -- win, loss, draw
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_bases_player_id ON bases(player_id);
CREATE INDEX IF NOT EXISTS idx_bases_coords ON bases(x_coord, y_coord);
CREATE INDEX IF NOT EXISTS idx_units_player_id ON units(player_id);
CREATE INDEX IF NOT EXISTS idx_units_base_id ON units(base_id);
CREATE INDEX IF NOT EXISTS idx_resources_player_id ON resources(player_id);
CREATE INDEX IF NOT EXISTS idx_research_player_id ON research(player_id);
CREATE INDEX IF NOT EXISTS idx_alliances_leader ON alliances(leader_player_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members ON alliance_members(alliance_id, player_id);
CREATE INDEX IF NOT EXISTS idx_battles_players ON battles(attacker_player_id, defender_player_id);
