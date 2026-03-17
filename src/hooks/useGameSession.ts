import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Question } from '../lib/supabase';
import type { GameResult } from '../types/game';

export function useGameSession() {
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);

  const createSession = async () => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        total_score: 0,
        questions_answered: 0,
        correct_answers: 0,
        is_completed: false,
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    setGameSessionId(sessionData.id);
    return sessionData.id;
  };

  const updateSession = async (score: number, questions: Question[], results: GameResult[]) => {
    if (!gameSessionId) return;
    
    try {
      const totalQuestions = questions.length;
      const correctAnswers = results.filter(r => r.correct).length;
      
      await supabase
        .from('game_sessions')
        .update({
          total_score: score,
          questions_answered: totalQuestions,
          correct_answers: correctAnswers,
        })
        .eq('id', gameSessionId);
    } catch (err) {
      console.error('Failed to update game session:', err);
    }
  };

  const completeSession = async (playerId: string) => {
    if (!gameSessionId) return;
    
    await supabase
      .from('game_sessions')
      .update({
        player_id: playerId,
        completed_at: new Date().toISOString(),
        is_completed: true,
      })
      .eq('id', gameSessionId);
  };

  return {
    gameSessionId,
    createSession,
    updateSession,
    completeSession,
  };
}
