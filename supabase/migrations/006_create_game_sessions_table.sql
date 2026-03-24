-- Create game sessions table to track user game progress
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile_id ON public.game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON public.game_sessions(is_completed);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to game sessions
CREATE POLICY "Allow public read access to game sessions"
    ON public.game_sessions
    FOR SELECT
    USING (true);

-- Allow anyone to insert game sessions
CREATE POLICY "Allow anyone to insert game sessions"
    ON public.game_sessions
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update game sessions
CREATE POLICY "Allow anyone to update game sessions"
    ON public.game_sessions
    FOR UPDATE
    USING (true);

-- Add function to update profile stats after game completion
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if game is being marked as completed
    IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
        UPDATE public.profiles
        SET 
            total_games_played = total_games_played + 1,
            best_score = GREATEST(best_score, NEW.total_score),
            total_score = total_score + NEW.total_score,
            updated_at = NOW()
        WHERE id = NEW.profile_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update profile stats when game is completed
CREATE TRIGGER on_game_completed
    AFTER UPDATE ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_stats();

-- Add comments
COMMENT ON TABLE public.game_sessions IS 'Tracks individual game sessions and scores';
COMMENT ON COLUMN public.game_sessions.profile_id IS 'Reference to the player profile';
COMMENT ON FUNCTION public.update_profile_stats IS 'Updates profile statistics when a game session is completed';
