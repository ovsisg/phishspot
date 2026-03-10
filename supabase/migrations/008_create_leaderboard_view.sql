-- Create a view for the public leaderboard
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id,
    p.name,
    p.country,
    p.best_score,
    p.total_score,
    p.total_games_played,
    ROUND(p.total_score::NUMERIC / NULLIF(p.total_games_played, 0), 2) AS average_score,
    p.created_at,
    ROW_NUMBER() OVER (ORDER BY p.best_score DESC, p.total_score DESC) AS rank
FROM public.profiles p
WHERE p.total_games_played > 0
ORDER BY p.best_score DESC, p.total_score DESC;

-- Grant public access to the leaderboard view
GRANT SELECT ON public.leaderboard TO anon;
GRANT SELECT ON public.leaderboard TO authenticated;

-- Create a view for recent game sessions (last 100 completed games)
CREATE OR REPLACE VIEW public.recent_games AS
SELECT 
    gs.id,
    p.name,
    p.country,
    gs.total_score,
    gs.questions_answered,
    gs.correct_answers,
    ROUND((gs.correct_answers::NUMERIC / NULLIF(gs.questions_answered, 0)) * 100, 2) AS accuracy_percentage,
    gs.started_at,
    gs.completed_at
FROM public.game_sessions gs
JOIN public.profiles p ON gs.profile_id = p.id
WHERE gs.is_completed = true
ORDER BY gs.completed_at DESC
LIMIT 100;

-- Grant public access to recent games view
GRANT SELECT ON public.recent_games TO anon;
GRANT SELECT ON public.recent_games TO authenticated;

-- Add comments
COMMENT ON VIEW public.leaderboard IS 'Public leaderboard showing top players by best score';
COMMENT ON VIEW public.recent_games IS 'Recent completed game sessions with player information';
