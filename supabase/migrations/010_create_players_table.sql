-- Create players table for game participants (separate from authenticated profiles)
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    total_games_played INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_best_score ON public.players(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON public.players(created_at DESC);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow public read access to players
CREATE POLICY "Allow public read access to players"
    ON public.players
    FOR SELECT
    USING (true);

-- Allow anyone to insert players
CREATE POLICY "Allow anyone to insert players"
    ON public.players
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update players
CREATE POLICY "Allow anyone to update players"
    ON public.players
    FOR UPDATE
    USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON public.players
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update game_sessions table to reference players instead of profiles
ALTER TABLE public.game_sessions
    ADD COLUMN player_id UUID REFERENCES public.players(id) ON DELETE CASCADE;

-- Make profile_id nullable since we'll use player_id for game sessions
ALTER TABLE public.game_sessions
    ALTER COLUMN profile_id DROP NOT NULL;

-- Add index for player_id
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON public.game_sessions(player_id);

-- Update the trigger function to work with players table
DROP FUNCTION IF EXISTS public.update_profile_stats() CASCADE;

CREATE OR REPLACE FUNCTION public.update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if game is being marked as completed
    IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
        -- Update player stats if player_id exists
        IF NEW.player_id IS NOT NULL THEN
            UPDATE public.players
            SET 
                total_games_played = total_games_played + 1,
                best_score = GREATEST(best_score, NEW.total_score),
                total_score = total_score + NEW.total_score,
                updated_at = NOW()
            WHERE id = NEW.player_id;
        END IF;
        
        -- Update profile stats if profile_id exists (for authenticated users)
        IF NEW.profile_id IS NOT NULL THEN
            UPDATE public.profiles
            SET 
                total_games_played = total_games_played + 1,
                best_score = GREATEST(best_score, NEW.total_score),
                total_score = total_score + NEW.total_score,
                updated_at = NOW()
            WHERE id = NEW.profile_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_game_completed
    AFTER UPDATE ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_player_stats();

-- Update leaderboard view to include players
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    COALESCE(p.name, pl.name) as player_name,
    COALESCE(p.country, pl.country) as country,
    COALESCE(p.best_score, pl.best_score) as best_score,
    COALESCE(p.total_games_played, pl.total_games_played) as total_games,
    COALESCE(p.total_score, pl.total_score) as total_score
FROM public.profiles p
FULL OUTER JOIN public.players pl ON false
WHERE p.role = 'player' OR pl.id IS NOT NULL
ORDER BY best_score DESC
LIMIT 100;

-- Update recent_games view to include players
DROP VIEW IF EXISTS public.recent_games;

CREATE OR REPLACE VIEW public.recent_games AS
SELECT 
    gs.id,
    COALESCE(p.name, pl.name) as player_name,
    COALESCE(p.country, pl.country) as country,
    gs.total_score as score,
    gs.questions_answered,
    gs.correct_answers,
    gs.completed_at
FROM public.game_sessions gs
LEFT JOIN public.profiles p ON gs.profile_id = p.id
LEFT JOIN public.players pl ON gs.player_id = pl.id
WHERE gs.is_completed = true
ORDER BY gs.completed_at DESC
LIMIT 50;

-- Add comments
COMMENT ON TABLE public.players IS 'Stores player information for game participants (non-authenticated users)';
COMMENT ON COLUMN public.game_sessions.player_id IS 'Reference to the player (for non-authenticated users)';
COMMENT ON FUNCTION public.update_player_stats IS 'Updates player or profile statistics when a game session is completed';
