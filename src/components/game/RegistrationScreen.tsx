import { useState } from "react";
import { countries } from "../../data/countries";
import type { Question } from "../../lib/supabase";
import type { GameResult } from "../../types/game";

interface RegistrationScreenProps {
  questions: Question[];
  results: GameResult[];
  score: number;
  onRegister: (name: string, country: string) => Promise<void>;
  onUuidLookup: (uuid: string) => Promise<void>;
  onSkip: () => void;
  error: string;
}

export function RegistrationScreen({
  questions,
  results,
  score,
  onRegister,
  onUuidLookup,
  onSkip,
  error,
}: RegistrationScreenProps) {
  const [useExistingPlayer, setUseExistingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerCountry, setPlayerCountry] = useState("");
  const [playerUuid, setPlayerUuid] = useState("");

  const RETURNING_PLAYER_DISABLED = true;

  const totalQuestions = questions.length;
  const correctAnswers = results.filter((r) => r.correct).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(playerName, playerCountry);
  };

  const handleUuidSubmit = async () => {
    await onUuidLookup(playerUuid);
  };

  return (
    <div className="game-registration">
      <h2>Great Job!</h2>

      <div className="score-preview">
        <div className="score-circle-small">
          <span className="score-number">{score}</span>
          <span className="score-label">Points</span>
        </div>
        <div className="score-stats">
          <p>
            <strong>
              {correctAnswers}/{totalQuestions}
            </strong>{" "}
            correct answers
          </p>
          <p>
            <strong>{percentage}%</strong> accuracy
          </p>
        </div>
      </div>

      <p className="registration-description">
        Save your score to the leaderboard!
      </p>

      <div
        className="player-type-tabs"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          margin: "25px 0",
        }}
      >
        <div
          className={`tab-option ${!useExistingPlayer ? "active" : ""}`}
          onClick={() => setUseExistingPlayer(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "20px",
            background: !useExistingPlayer
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))"
              : "var(--bg-card)",
            border: !useExistingPlayer
              ? "3px solid var(--accent-color)"
              : "2px solid var(--border-color)",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: !useExistingPlayer
              ? "0 8px 16px rgba(139, 92, 246, 0.2)"
              : "var(--shadow)",
          }}
        >
          <span style={{ fontSize: "40px", flexShrink: 0 }}>🆕</span>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              New Player
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              First time playing
            </p>
          </div>
        </div>
        <div
          className={`tab-option ${useExistingPlayer ? "active" : ""}`}
          onClick={() => {
            if (!RETURNING_PLAYER_DISABLED) {
              setUseExistingPlayer(true);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "20px",
            background: useExistingPlayer
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))"
              : "var(--bg-card)",
            border: useExistingPlayer
              ? "3px solid var(--accent-color)"
              : "2px solid var(--border-color)",
            borderRadius: "12px",
            cursor: RETURNING_PLAYER_DISABLED ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: useExistingPlayer
              ? "0 8px 16px rgba(139, 92, 246, 0.2)"
              : "var(--shadow)",
            opacity: RETURNING_PLAYER_DISABLED ? 0.5 : 1,
          }}
        >
          <span style={{ fontSize: "40px", flexShrink: 0 }}>🔑</span>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              Returning Player
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              {RETURNING_PLAYER_DISABLED ? "Coming soon!" : "I have a UUID"}
            </p>
          </div>
        </div>
      </div>

      {useExistingPlayer ? (
        <div className="uuid-lookup-form">
          <div className="info-box">
            <p>
              🔑 <strong>Returning Player?</strong>
            </p>
            <p>
              Enter your Player UUID to link this game to your account and
              increase your total games played!
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="playerUuid">Player UUID</label>
            <input
              type="text"
              id="playerUuid"
              value={playerUuid}
              onChange={(e) => setPlayerUuid(e.target.value)}
              placeholder="Paste your UUID here"
              className="uuid-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onSkip} className="skip-btn">
              Skip
            </button>
            <button
              type="button"
              onClick={handleUuidSubmit}
              className="submit-btn"
            >
              Load Player Data
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="playerName">Nickname</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter a nickname (do not use your real name)"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="playerCountry">Country</label>
            <select
              id="playerCountry"
              value={playerCountry}
              onChange={(e) => setPlayerCountry(e.target.value)}
              required
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onSkip} className="skip-btn">
              Skip
            </button>
            <button type="submit" className="submit-btn">
              Save to Leaderboard
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
