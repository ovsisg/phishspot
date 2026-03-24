import { motion } from "framer-motion";
import type { Question } from "../../lib/supabase";
import type { GameResult } from "../../types/game";

interface FinishedScreenProps {
  questions: Question[];
  results: GameResult[];
  score: number;
  playerId: string | null;
  playerName: string;
  onLeaderboard: () => void;
  onPlayAgain: () => void;
  hasPlayedGame?: boolean;
}

export function FinishedScreen({
  questions,
  results,
  score,
  playerId,
  playerName,
  onLeaderboard,
  onPlayAgain,
  hasPlayedGame,
}: FinishedScreenProps) {
  const totalQuestions = questions.length;
  const correctAnswers = results.filter((r) => r.correct).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <motion.div
      className="game-finished"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1>{playerId ? "Saved to Leaderboard!" : "Game Complete!"}</h1>

      {playerId && (
        <p className="saved-message">
          Thanks, <strong>{playerName}</strong>! Your score has been saved.
        </p>
      )}

      <div className="final-score">
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-label">Points</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">
              {correctAnswers}/{totalQuestions}
            </span>
            <span className="stat-label">Correct Answers</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{percentage}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
      </div>

      <div className="performance-message">
        {percentage >= 80 ? (
          <p>Excellent! You're a phishing detection expert!</p>
        ) : percentage >= 60 ? (
          <p>Good job! Keep practicing to improve your skills.</p>
        ) : percentage >= 40 ? (
          <p>Not bad, but there's room for improvement.</p>
        ) : (
          <p>You might want to learn more about phishing emails.</p>
        )}
      </div>

      <div className="game-actions">
        <motion.button
          onClick={onPlayAgain}
          className="play-again-btn"
          disabled={hasPlayedGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Again
        </motion.button>
        <motion.button
          onClick={onLeaderboard}
          className="leaderboard-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Leaderboard
        </motion.button>
      </div>
    </motion.div>
  );
}
