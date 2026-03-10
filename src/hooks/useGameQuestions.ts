import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../lib/supabase';

export function useGameQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');

  const fetchQuestions = async () => {
    setError('');
    
    try {
      // Fetch only questions that have the new multiple choice format
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .not('correct_option', 'is', null); // Only get questions with new format

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        setError('No questions available. Please ask an admin to add questions.');
        return null;
      }

      // Shuffle and select 10 questions
      const shuffled = questionsData.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 10);

      setQuestions(selected);
      return selected;
    } catch (err: any) {
      setError(err.message || 'Failed to load questions');
      return null;
    }
  };

  return {
    questions,
    error,
    fetchQuestions,
  };
}
