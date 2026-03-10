-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('phishing', 'no_phishing')),
    email_image_url TEXT NOT NULL,
    correct_answer BOOLEAN NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 0),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);

-- Create trigger for questions table
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.questions IS 'Stores phishing and non-phishing email questions with images';
COMMENT ON COLUMN public.questions.question_type IS 'Type of question: phishing or no_phishing';
COMMENT ON COLUMN public.questions.email_image_url IS 'URL to the email image stored in Supabase storage bucket';
COMMENT ON COLUMN public.questions.correct_answer IS 'TRUE if email is phishing, FALSE if not phishing';
COMMENT ON COLUMN public.questions.created_by IS 'Reference to profile who created this question (nullable)';
