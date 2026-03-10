-- Create follow-up questions table
CREATE TABLE IF NOT EXISTS public.followup_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    followup_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c')),
    explanation TEXT,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_followup_questions_question_id ON public.followup_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_followup_questions_order ON public.followup_questions(question_id, order_index);

-- Create trigger for followup_questions table
CREATE TRIGGER update_followup_questions_updated_at
    BEFORE UPDATE ON public.followup_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.followup_questions IS 'Stores follow-up questions to test user understanding (no points awarded)';
COMMENT ON COLUMN public.followup_questions.followup_text IS 'The follow-up question text';
COMMENT ON COLUMN public.followup_questions.correct_option IS 'The correct answer option: a, b, or c';
COMMENT ON COLUMN public.followup_questions.order_index IS 'Order in which follow-up questions should appear';
