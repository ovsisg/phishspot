import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import '../styles/leaderboard.css';

interface LeaderboardEntry {
  player_name: string;
  country: string;
  best_score: number;
  total_games: number;
  total_score: number;
}

export function Leaderboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('best_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-container">
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div className="leaderboard-content">
        <motion.div
          className="leaderboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => navigate('/')} className="back-to-game-btn">
            ← Back to Game
          </button>
          <h1>🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Top Players Worldwide</p>
        </motion.div>

        {loading ? (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner"></div>
            <p>Loading leaderboard...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="error-message">{error}</p>
            <button onClick={fetchLeaderboard} className="retry-btn">
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="leaderboard-table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="leaderboard-table">
              <div className="table-header">
                <div className="col-rank">Rank</div>
                <div className="col-player">Player</div>
                <div className="col-country">Country</div>
                <div className="col-score">Best Score</div>
                <div className="col-games">Games</div>
              </div>

              <div className="table-body">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={`${entry.player_name}-${index}`}
                    className={`table-row ${index < 3 ? 'top-three' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-secondary)', transition: { duration: 0.15 } }}
                  >
                    <div className="col-rank">
                      <span className={`rank-badge ${index < 3 ? 'medal' : ''}`}>
                        {getMedalEmoji(index + 1)}
                      </span>
                    </div>
                    <div className="col-player">
                      <span className="player-name">{entry.player_name}</span>
                    </div>
                    <div className="col-country">
                      <span className="country-name">{entry.country}</span>
                    </div>
                    <div className="col-score">
                      <span className="score-value">{entry.best_score}</span>
                    </div>
                    <div className="col-games">
                      <span className="games-count">{entry.total_games}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
