import { useState } from "react";
import { countries } from "../../data/countries";
import type { Question } from "../../lib/supabase";
import type { GameResult } from "../../types/game";

interface SaveScoreScreenProps {
  questions: Question[];
  results: GameResult[];
  score: number;
  onRegister: (name: string, country: string) => Promise<void>;
  onSkip: () => void;
  error: string;
}

export function SaveScoreScreen({
  questions,
  results,
  score,
  onRegister,
  onSkip,
  error,
}: SaveScoreScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const [playerCountry, setPlayerCountry] = useState("");

  const totalQuestions = questions.length;
  const correctAnswers = results.filter((r) => r.correct).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(playerName, playerCountry);
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
    </div>
  );
}
