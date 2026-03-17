-- Add timer_duration column to questions table
ALTER TABLE public.questions
ADD COLUMN timer_duration INTEGER NOT NULL DEFAULT 30 CHECK (timer_duration > 0);

-- Add comment
COMMENT ON COLUMN public.questions.timer_duration IS 'Duration in seconds for how long the question should be displayed (default: 30)';
