# Supabase Migrations for Phishing Game

This folder contains SQL migration files to set up your Supabase database for the phishing game.

## Migration Order

Run these migrations in the Supabase SQL Editor in the following order:

1. **001_create_base_functions.sql** - Creates reusable functions (update_updated_at_column)
2. **002_create_profiles_table.sql** - Creates profiles table with role support (no auth required)
3. **003_create_questions_table.sql** - Creates the questions table for phishing/non-phishing emails
4. **004_create_followup_questions_table.sql** - Creates the follow-up questions table
5. **005_create_storage_buckets.sql** - Creates storage buckets for email images
6. **006_create_rls_policies.sql** - Sets up Row Level Security policies
7. **007_create_game_sessions_table.sql** - Creates table to track game sessions and scores
8. **008_create_leaderboard_view.sql** - Creates public leaderboard and recent games views
9. **009_add_timer_duration.sql** - Adds timer_duration column to questions (default: 30 seconds)
10. **010_create_players_table.sql** - Creates players table for non-authenticated users, updates game_sessions and views

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of each migration file (in order)
4. Paste into the SQL Editor
5. Click "Run" to execute
6. Verify the migration was successful before moving to the next one

**IMPORTANT**: Migration 005 (storage buckets) must be created via the Dashboard UI, not SQL Editor:
- Go to Storage section → Click "New bucket"
- Create `phishing-emails` bucket (Public: YES)
- Create `no-phishing-emails` bucket (Public: YES)

## Database Schema Overview

### Tables

- **profiles** - User profiles with name, country, role, and optional info (no auth required)
- **questions** - Stores phishing and non-phishing email questions
- **followup_questions** - Stores follow-up questions (3 options, no points)
- **game_sessions** - Tracks game progress and scores

### Views

- **leaderboard** - Public leaderboard ranked by best score
- **recent_games** - Last 100 completed games with player info

### Storage Buckets

- **phishing-emails** - Stores phishing email images
- **no-phishing-emails** - Stores legitimate email images

## Notes

- All tables have Row Level Security (RLS) enabled
- Public read access is allowed for game functionality
- **No Authentication Required**: Players enter info directly without signing up
- Only admins can manage questions and storage
- Storage buckets are publicly readable
- Timestamps are automatically managed with triggers
- **Profile Stats**: Game completion automatically updates profile stats (best score, total games, etc.)
- **Leaderboard**: Real-time public leaderboard showing top players by best score
- **User Info**: Players enter name and country (required), plus optional email, phone, company, and additional info
- **Roles**: Profiles have roles (admin/player), default is player
