-- Create profiles table (no auth dependency, standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    additional_info TEXT,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'player')),
    total_games_played INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_best_score ON public.profiles(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles (for leaderboard)
CREATE POLICY "Allow public read access to profiles"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Allow anyone to insert profiles (users enter info without auth)
CREATE POLICY "Allow anyone to insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to update any profile
CREATE POLICY "Allow admins to update profiles"
    ON public.profiles
    FOR UPDATE
    USING (role = 'admin');

-- Allow admins to delete profiles
CREATE POLICY "Allow admins to delete profiles"
    ON public.profiles
    FOR DELETE
    USING (role = 'admin');

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles with name, country, and optional information for leaderboard (no auth required)';
COMMENT ON COLUMN public.profiles.name IS 'User display name (required)';
COMMENT ON COLUMN public.profiles.country IS 'User country (required)';
COMMENT ON COLUMN public.profiles.email IS 'Optional contact email';
COMMENT ON COLUMN public.profiles.phone IS 'Optional phone number';
COMMENT ON COLUMN public.profiles.company IS 'Optional company name';
COMMENT ON COLUMN public.profiles.additional_info IS 'Any additional optional information';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin or player (default: player)';
COMMENT ON COLUMN public.profiles.best_score IS 'Best score achieved across all games';
COMMENT ON COLUMN public.profiles.total_score IS 'Cumulative score across all games';
