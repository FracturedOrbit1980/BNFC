-- Benoni Northerns FC initial schema.
-- Apply in a Supabase project when credentials exist. Not required to build the app.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles Enum
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'HEAD_COACH', 'PLAYER');

-- 1. CLUBS
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Benoni Northerns FC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AGE GROUPS
CREATE TABLE age_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "Under 13"
    display_order INT NOT NULL
);

-- 3. TEAMS / SUBDIVISIONS
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    age_group_id UUID REFERENCES age_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "U13 Premier", "U13 Academy"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USERS & PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PLAYER',
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PLAYER DETAILS
CREATE TABLE player_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    squad_number INT,
    preferred_position VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DRILL REPOSITORY
CREATE TABLE drills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    is_club_official BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_age_group VARCHAR(50),
    objective_category VARCHAR(100), -- Technical, Tactical, Physical, Set Piece
    diagram_url TEXT,
    pitch_setup TEXT,
    instructions TEXT,
    coaching_points TEXT[],
    default_duration_seconds INT DEFAULT 300,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PLAYER EVALUATION METRICS (FOR RADAR GRAPHS)
CREATE TABLE player_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES player_details(id) ON DELETE CASCADE,
    evaluated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    technical_score INT CHECK (technical_score BETWEEN 1 AND 10),
    tactical_score INT CHECK (tactical_score BETWEEN 1 AND 10),
    physical_score INT CHECK (physical_score BETWEEN 1 AND 10),
    mental_score INT CHECK (mental_score BETWEEN 1 AND 10),
    notes TEXT
);

-- 8. MATCH LOGS & MINUTES
CREATE TABLE match_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    opponent VARCHAR(255) NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'SCHEDULED' -- SCHEDULED, LIVE, COMPLETED
);

CREATE TABLE match_player_minutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES match_sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES player_details(id) ON DELETE CASCADE,
    minutes_played NUMERIC(5,2) DEFAULT 0.0,
    is_on_pitch BOOLEAN DEFAULT FALSE
);

-- RLS stub (not applied in this slice).
-- When auth is wired, enable row level security and scope rows by profiles.role:
--   SUPER_ADMIN: all club rows
--   HEAD_COACH: rows for profiles.team_id (and any future coach-team assignments)
--   PLAYER: own profile, own player_details, own evaluations, and own match minutes
--
-- ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE player_details ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE player_evaluations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE match_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE match_player_minutes ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "super_admin_all_clubs" ON clubs
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--         AND profiles.role = 'SUPER_ADMIN'
--     )
--   );
