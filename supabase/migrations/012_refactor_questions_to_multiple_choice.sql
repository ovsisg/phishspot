-- Migration: Refactor questions table to multiple choice format
-- This migration adds 5 options (A-E) and question_text to the questions table
-- The old binary format (correct_answer boolean) is replaced with correct_option

-- Add new columns for multiple choice format
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_text TEXT DEFAULT 'What best describes this email?';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_a TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_b TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_c TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_d TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_e TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_option TEXT CHECK (correct_option IN ('a', 'b', 'c', 'd', 'e'));

-- Add comments for new columns
COMMENT ON COLUMN public.questions.question_text IS 'The question text displayed to the user';
COMMENT ON COLUMN public.questions.option_a IS 'Option A text';
COMMENT ON COLUMN public.questions.option_b IS 'Option B text';
COMMENT ON COLUMN public.questions.option_c IS 'Option C text';
COMMENT ON COLUMN public.questions.option_d IS 'Option D text';
COMMENT ON COLUMN public.questions.option_e IS 'Option E text';
COMMENT ON COLUMN public.questions.correct_option IS 'The correct answer option: a, b, c, d, or e';

-- Note: We keep the old columns (question_type, correct_answer) for backward compatibility
-- They can be removed in a future migration after all questions are migrated to new format
