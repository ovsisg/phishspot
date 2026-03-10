-- Enable Row Level Security on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_questions ENABLE ROW LEVEL SECURITY;

-- Questions table policies
-- Allow anyone to read active questions (for game purposes)
CREATE POLICY "Allow public read access to active questions"
    ON public.questions
    FOR SELECT
    USING (is_active = true);

-- Allow admins to insert questions
CREATE POLICY "Allow admins to insert questions"
    ON public.questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = created_by
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update questions
CREATE POLICY "Allow admins to update questions"
    ON public.questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = created_by
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete questions
CREATE POLICY "Allow admins to delete questions"
    ON public.questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = created_by
            AND profiles.role = 'admin'
        )
    );

-- Follow-up questions table policies
-- Allow anyone to read follow-up questions (for game purposes)
CREATE POLICY "Allow public read access to followup questions"
    ON public.followup_questions
    FOR SELECT
    USING (true);

-- Allow admins to insert follow-up questions
CREATE POLICY "Allow admins to insert followup questions"
    ON public.followup_questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.profiles p ON q.created_by = p.id
            WHERE q.id = question_id
            AND p.role = 'admin'
        )
    );

-- Allow admins to update follow-up questions
CREATE POLICY "Allow admins to update followup questions"
    ON public.followup_questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.profiles p ON q.created_by = p.id
            WHERE q.id = followup_questions.question_id
            AND p.role = 'admin'
        )
    );

-- Allow admins to delete follow-up questions
CREATE POLICY "Allow admins to delete followup questions"
    ON public.followup_questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.profiles p ON q.created_by = p.id
            WHERE q.id = followup_questions.question_id
            AND p.role = 'admin'
        )
    );

-- Storage policies for phishing-emails bucket
CREATE POLICY "Allow public read access to phishing emails"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'phishing-emails');

CREATE POLICY "Allow admins to upload phishing emails"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'phishing-emails');

CREATE POLICY "Allow admins to update phishing emails"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'phishing-emails');

CREATE POLICY "Allow admins to delete phishing emails"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'phishing-emails');

-- Storage policies for no-phishing-emails bucket
CREATE POLICY "Allow public read access to no-phishing emails"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'no-phishing-emails');

CREATE POLICY "Allow admins to upload no-phishing emails"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'no-phishing-emails');

CREATE POLICY "Allow admins to update no-phishing emails"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'no-phishing-emails');

CREATE POLICY "Allow admins to delete no-phishing emails"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'no-phishing-emails');
