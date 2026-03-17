-- Add option_d column to followup_questions table
ALTER TABLE followup_questions
ADD COLUMN IF NOT EXISTS option_d TEXT NOT NULL DEFAULT '';

-- Update the correct_option check constraint to include 'd'
ALTER TABLE followup_questions
DROP CONSTRAINT IF EXISTS followup_questions_correct_option_check;

ALTER TABLE followup_questions
ADD CONSTRAINT followup_questions_correct_option_check 
CHECK (correct_option IN ('a', 'b', 'c', 'd'));

-- Add comment
COMMENT ON COLUMN followup_questions.option_d IS 'Fourth multiple choice option for follow-up question';
