import { motion } from "framer-motion";

interface IdleScreenProps {
  error: string;
  onStartGame: () => void;
  hasPlayedGame?: boolean;
}

export function IdleScreen({
  error,
  onStartGame,
  hasPlayedGame,
}: IdleScreenProps) {
  return (
    <motion.div
      className="game-landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        PhishSpot
      </motion.h1>

      <motion.p
        className="game-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        You will be shown 10 emails and asked to choose the option that best
        describes each one from five possible answers. Please play the game once
        only before continuing to the post-test.
      </motion.p>

      <motion.div
        className="game-flow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flow-row">
          <div className="flow-step">
            <div className="flow-number">1</div>
            <div className="flow-icon">📧</div>
            <p>View Email</p>
          </div>

          <div className="flow-connector"></div>

          <div className="flow-step">
            <div className="flow-number">2</div>
            <div className="flow-icon">🤔</div>
            <p>Analyse</p>
          </div>

          <div className="flow-connector"></div>

          <div className="flow-step">
            <div className="flow-number">3</div>
            <div className="flow-icon">✅</div>
            <p>Answer</p>
          </div>

          <div className="flow-connector"></div>

          <div className="flow-step">
            <div className="flow-number">4</div>
            <div className="flow-icon">🏆</div>
            <p>Score!</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="game-rules"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="rules-main-title" style={{ marginBottom: "20px" }}>
          Scoring System
        </h2>
        <div className="rules-grid">
          <div className="rule-card">
            <h4
              className="rule-title"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              <span className="rule-icon success" style={{ fontSize: "32px" }}>
                ✅
              </span>
              Correct Answer
            </h4>
            <p style={{ fontSize: "16px" }}>Earn points + time bonus</p>
          </div>
          <div className="rule-card">
            <h4
              className="rule-title"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              <span className="rule-icon error" style={{ fontSize: "32px" }}>
                ❌
              </span>
              Wrong Answer
            </h4>
            <p style={{ fontSize: "16px" }}>0 points</p>
          </div>
          <div className="rule-card">
            <h4
              className="rule-title"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              <span className="rule-icon warning" style={{ fontSize: "32px" }}>
                ⏱️
              </span>
              Time's Up
            </h4>
            <p style={{ fontSize: "16px" }}>+1 point</p>
          </div>
          <div className="rule-card">
            <h4
              className="rule-title"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              <span className="rule-icon info" style={{ fontSize: "32px" }}>
                ⚡
              </span>
              Time Bonus
            </h4>
            <p style={{ fontSize: "14px" }}>
              40-31s: +7 | 30-21s: +5 | 20-11s: +3 | 10-1s: +1
            </p>
          </div>
        </div>
      </motion.div>

      {error && <div className="error-message">{error}</div>}

      <motion.button
        onClick={onStartGame}
        className="start-game-btn"
        disabled={hasPlayedGame}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Game
      </motion.button>
    </motion.div>
  );
}
