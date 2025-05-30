CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    elo_rating INT DEFAULT 1000,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_model (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    player_id BIGINT,
    accuracy DOUBLE PRECISION,
    speed_score INTEGER,
    deployed BOOLEAN DEFAULT FALSE,
    popularity_score INTEGER DEFAULT 0,
    credits_per_minute INTEGER DEFAULT 0,
    parameters TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS upgrade (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT,
    upgrade_type VARCHAR(255),
    level INTEGER DEFAULT 1,
    upgrade_finish_time TIMESTAMP WITHOUT TIME ZONE,
    is_upgrading BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
);

-- Удаляем таблицу clans, если она была
DROP TABLE IF EXISTS clans CASCADE;
-- CASCADE удалит зависимые объекты, например fk_clan, если он еще не удален

-- Изменяем таблицу players
-- Сначала удаляем старое ограничение, если оно еще как-то осталось (на всякий случай)
ALTER TABLE IF EXISTS players DROP CONSTRAINT IF EXISTS fk_clan;

-- Если колонка clan_id существует, удаляем ее
ALTER TABLE IF EXISTS players DROP COLUMN IF EXISTS clan_id;

-- Обновленное определение таблицы players (без clan_id)
CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    -- clan_id BIGINT, -- ЭТУ СТРОКУ НУЖНО УДАЛИТЬ ИЛИ ЗАКОММЕНТИРОВАТЬ
    -- ... другие поля игрока ...
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Команду ALTER TABLE players ADD CONSTRAINT fk_clan ... НУЖНО ПОЛНОСТЬЮ УДАЛИТЬ

-- ... определения других таблиц (ai_model, upgrade и т.д.) ...
-- Убедитесь, что для них используются CREATE TABLE IF NOT EXISTS
-- и для ограничений ALTER TABLE ... ADD CONSTRAINT ... используется DROP CONSTRAINT IF EXISTS ... перед добавлением

CREATE TABLE IF NOT EXISTS ai_model (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    player_id BIGINT, -- Если есть связь с player, она остается
    accuracy DOUBLE PRECISION,
    speed_score INTEGER,
    deployed BOOLEAN DEFAULT FALSE,
    popularity_score INTEGER DEFAULT 0,
    credits_per_minute INTEGER DEFAULT 0,
    parameters TEXT, -- Или JSON/JSONB в зависимости от ваших нужд
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE SET NULL -- Пример связи с players
);

CREATE TABLE IF NOT EXISTS upgrade (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT,
    upgrade_type VARCHAR(255), -- Например, 'ai_accuracy', 'ai_speed'
    level INTEGER DEFAULT 1,
    start_time TIMESTAMP, -- Добавляем эту колонку
    end_time TIMESTAMP, -- Добавляем эту колонку
    upgrade_finish_time TIMESTAMP WITHOUT TIME ZONE,
    is_upgrading BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE -- Пример связи с players
);

ALTER TABLE upgrade
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- И так далее для всех ваших таблиц...

-- Matchmaking Queue Table
CREATE TABLE IF NOT EXISTS matchmaking_queue (
    player_id BIGINT PRIMARY KEY,
    model_id BIGINT NOT NULL,
    match_type VARCHAR(255) NOT NULL,
    elo_rating INT NOT NULL,
    search_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'SEARCHING', -- SEARCHING, MATCHED_PENDING_CONFIRMATION
    CONSTRAINT fk_player_matchmaking FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    CONSTRAINT fk_model_matchmaking FOREIGN KEY (model_id) REFERENCES ai_model(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_type_elo ON matchmaking_queue (match_type, elo_rating, status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_search_time ON matchmaking_queue (search_start_time);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    player1_id BIGINT NOT NULL,
    player2_id BIGINT NOT NULL,
    player1_model_id BIGINT,
    player2_model_id BIGINT,
    match_type VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITHOUT TIME ZONE,
    winner_id BIGINT,
    player1_score INTEGER,
    player2_score INTEGER,
    match_data TEXT, -- For storing game-specific data, like moves, state, etc.

    CONSTRAINT fk_player1 FOREIGN KEY (player1_id) REFERENCES players (id) ON DELETE CASCADE,
    CONSTRAINT fk_player2 FOREIGN KEY (player2_id) REFERENCES players (id) ON DELETE CASCADE,
    CONSTRAINT fk_player1_model FOREIGN KEY (player1_model_id) REFERENCES ai_model (id) ON DELETE SET NULL,
    CONSTRAINT fk_player2_model FOREIGN KEY (player2_model_id) REFERENCES ai_model (id) ON DELETE SET NULL,
    CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES players (id) ON DELETE SET NULL,
    CONSTRAINT check_players_not_same CHECK (player1_id <> player2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches (player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches (player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches (ended_at) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON matches (match_type);