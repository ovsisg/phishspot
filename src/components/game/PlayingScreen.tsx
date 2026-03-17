import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Question } from "../../lib/supabase";
import type { RandomisedOption } from "../../types/game";

interface PlayingScreenProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  correctAnswersCount: number;
  timeLeft: number;
  timerColor: string;
  score: number;
  onAnswer: (option: "a" | "b" | "c" | "d" | "e") => void;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PlayingScreen({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  correctAnswersCount,
  timeLeft,
  timerColor,
  score,
  onAnswer,
}: PlayingScreenProps) {
  // Randomise options once when question changes
  const [randomisedOptions, setRandomisedOptions] = useState<
    RandomisedOption[]
  >([]);

  useEffect(() => {
    const options: RandomisedOption[] = [
      { key: "a", text: currentQuestion.option_a },
      { key: "b", text: currentQuestion.option_b },
      { key: "c", text: currentQuestion.option_c },
      { key: "d", text: currentQuestion.option_d },
      { key: "e", text: currentQuestion.option_e },
    ];
    setRandomisedOptions(shuffleArray(options));
  }, [currentQuestion.id]);

  return (
    <motion.div
      className="game-playing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
        <div className="game-correct-count">
          {correctAnswersCount} / {currentQuestionIndex} correct
        </div>
        <div className={`game-timer ${timerColor}`}>{timeLeft}s</div>
        <div className="game-score">Score: {score}</div>
      </motion.div>

      <div className="question-container">
        <motion.div
          className="email-image-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <img
            src={currentQuestion.email_image_url}
            alt="Email to analyse"
            className="email-image"
          />
        </motion.div>

        <motion.p
          className="question-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {currentQuestion.question_text}
        </motion.p>

        <motion.div
          className="option-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {randomisedOptions.map((option, index) => (
            <motion.button
              key={option.key}
              onClick={() => onAnswer(option.key)}
              className="option-btn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option.text}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
