import { motion } from 'framer-motion';
import type { Question } from '../../lib/supabase';

interface AnsweredScreenProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  isCorrect: boolean | null;
  selectedOption: 'a' | 'b' | 'c' | 'd' | 'e' | null;
  timeBonus?: number;
  onNext: () => void;
}

// Helper to get option text by key
function getOptionText(question: Question, key: 'a' | 'b' | 'c' | 'd' | 'e'): string {
  const optionMap = {
    a: question.option_a,
    b: question.option_b,
    c: question.option_c,
    d: question.option_d,
    e: question.option_e,
  };
  return optionMap[key];
}

export function AnsweredScreen({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  score,
  isCorrect,
  selectedOption,
  timeBonus = 0,
  onNext,
}: AnsweredScreenProps) {
  const correctOptionText = getOptionText(currentQuestion, currentQuestion.correct_option);
  const selectedOptionText = selectedOption ? getOptionText(currentQuestion, selectedOption) : null;

  return (
    <motion.div 
      className="game-answered"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="game-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="game-progress">
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </div>
        <div className="game-score">
          Score: {score}
        </div>
      </motion.div>

      <motion.div 
        className="answer-result"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </div>

        {/* Show what user selected vs correct answer */}
        <div className="answer-comparison">
          {selectedOption && !isCorrect && (
            <div className="selected-answer wrong">
              <span className="answer-label">Your answer:</span>
              <span className="answer-text">{selectedOptionText}</span>
            </div>
          )}
          <div className="correct-answer">
            <span className="answer-label">Correct answer:</span>
            <span className="answer-text">{correctOptionText}</span>
          </div>
        </div>
        
        {isCorrect ? (
          <>
            <p className="points-earned">+{currentQuestion.points} points</p>
            {timeBonus > 0 && (
              <motion.p 
                className="time-bonus"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                ⚡ +{timeBonus} time bonus!
              </motion.p>
            )}
          </>
        ) : selectedOption === null ? (
          <p className="points-earned">+1 point</p>
        ) : (
          <p className="points-zero">0 points</p>
        )}
        
        {currentQuestion.explanation && (
          <div className="explanation-box">
            <h4>Explanation</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </motion.div>

      <motion.button 
        onClick={onNext} 
        className="continue-btn"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Game'}
      </motion.button>
    </motion.div>
  );
}
