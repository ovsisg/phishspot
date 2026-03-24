import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import { useTimer } from "../hooks/useTimer";
import { useGameSession } from "../hooks/useGameSession";
import { useGameQuestions } from "../hooks/useGameQuestions";
import { IdleScreen } from "../components/game/IdleScreen";
import { LoadingScreen } from "../components/game/LoadingScreen";
import { PlayingScreen } from "../components/game/PlayingScreen";
import { AnsweredScreen } from "../components/game/AnsweredScreen";
import { SaveScoreScreen } from "../components/game/SaveScoreScreen";
import { FinishedScreen } from "../components/game/FinishedScreen";
import type { GameState, GameResult } from "../types/game";

export function Game() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [hasPlayedGame, setHasPlayedGame] = useState(() => {
    return localStorage.getItem("hasPlayedGame") === "true";
  });
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // New state for multiple choice
  const [selectedOption, setSelectedOption] = useState<
    "a" | "b" | "c" | "d" | "e" | null
  >(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const {
    questions,
    error: questionsError,
    fetchQuestions,
  } = useGameQuestions();
  const { createSession, updateSession, completeSession } = useGameSession();

  const currentQuestion = questions[currentQuestionIndex];

  const calculateTimeBonus = (timeLeft: number): number => {
    if (timeLeft >= 31) return 7; // 40-31 seconds
    if (timeLeft >= 21) return 5; // 30-21 seconds
    if (timeLeft >= 11) return 3; // 20-11 seconds
    if (timeLeft >= 1) return 1; // 10-1 seconds
    return 0; // 0 seconds
  };

  const handleTimeout = useCallback(() => {
    if (!timer.isPlayingRef.current) return;

    timer.isPlayingRef.current = false;
    timer.stopTimer();

    // NEW SCORING: Timeout gives +1 point (to avoid demotivation)
    setSelectedOption(null);
    setIsCorrect(false);
    setScore((prev) => prev + 1);

    setResults((prev) => {
      const lastQuestion = questions[currentQuestionIndex];
      if (!lastQuestion) return prev;

      const result: GameResult = {
        questionId: lastQuestion.id,
        selectedOption: null,
        correct: false,
        points: 1, // +1 for timeout
        timeSpent: lastQuestion.timer_duration,
      };
      return [...prev, result];
    });

    setGameState("answered");
  }, [questions, currentQuestionIndex]);

  const timer = useTimer(handleTimeout);

  const startGame = async () => {
    if (hasPlayedGame) {
      return;
    }

    setGameState("loading");
    setError("");

    try {
      await createSession();
      const loadedQuestions = await fetchQuestions();

      if (!loadedQuestions) {
        setGameState("idle");
        return;
      }

      setCurrentQuestionIndex(0);
      setScore(0);
      setResults([]);
      setCorrectAnswersCount(0);
      setGameState("playing");
      timer.isPlayingRef.current = true;
      timer.startTimer(loadedQuestions[0].timer_duration);
    } catch (err: any) {
      setError(err.message || "Failed to load questions");
      setGameState("idle");
    }
  };

  // NEW: Handle multiple choice answer
  const handleAnswer = (option: "a" | "b" | "c" | "d" | "e") => {
    if (!timer.isPlayingRef.current) return;

    timer.isPlayingRef.current = false;
    timer.stopTimer();
    const timeSpent = timer.getTimeSpent();

    const correct = option === currentQuestion.correct_option;
    const basePoints = correct ? currentQuestion.points : 0; // Wrong answer = 0 points
    const timeBonus = correct ? calculateTimeBonus(timer.timeLeft) : 0;
    const pointsEarned = basePoints + timeBonus;

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
    // Wrong answer = 0 points (no penalty)

    setSelectedOption(option);
    setIsCorrect(correct);
    setScore((prev) => prev + pointsEarned);

    const result: GameResult = {
      questionId: currentQuestion.id,
      selectedOption: option,
      correct,
      points: pointsEarned,
      timeSpent,
      timeBonus: correct ? timeBonus : undefined,
    };

    setResults((prev) => [...prev, result]);
    setGameState("answered");
  };

  // Simplified: No more followup, go directly to next question
  const goToNextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setGameState("playing");
      timer.isPlayingRef.current = true;
      timer.startTimer(questions[nextIndex].timer_duration);
    } else {
      updateSession(score, questions, results);
      setGameState("saveScore");
    }
  };

  const handleRegistration = async (name: string, country: string) => {
    if (!name.trim() || !country) {
      setError("Please enter a nickname and select a country");
      return;
    }

    setError("");

    try {
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          name: name.trim(),
          country: country,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setPlayerId(playerData.id);
      setPlayerName(name.trim());

      await completeSession(playerData.id);
      setGameState("finished");
    } catch (err: any) {
      setError(err.message || "Failed to save your information");
    }
  };

  const playAgain = () => {
    setHasPlayedGame(true);
    localStorage.setItem("hasPlayedGame", "true");

    setPlayerName("");
    setPlayerId(null);
    setGameState("idle");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (questionsError) {
      setError(questionsError);
    }
  }, [questionsError]);

  return (
    <div className="game-container">
      <div className={`game-nav ${isScrolled ? "scrolled" : ""}`}>
        <button
          onClick={() => navigate("/leaderboard")}
          className="nav-leaderboard-btn"
        >
          🏆 Leaderboard
        </button>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="game-content">
        {gameState === "idle" && (
          <IdleScreen
            error={error}
            onStartGame={startGame}
            hasPlayedGame={hasPlayedGame}
          />
        )}

        {gameState === "loading" && <LoadingScreen />}

        {gameState === "playing" && currentQuestion && (
          <PlayingScreen
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            correctAnswersCount={correctAnswersCount}
            timeLeft={timer.timeLeft}
            timerColor={timer.getTimerColor()}
            score={score}
            onAnswer={handleAnswer}
          />
        )}

        {gameState === "answered" && currentQuestion && (
          <AnsweredScreen
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            isCorrect={isCorrect}
            selectedOption={selectedOption}
            timeBonus={results[results.length - 1]?.timeBonus}
            onNext={goToNextQuestion}
          />
        )}

        {gameState === "saveScore" && (
          <SaveScoreScreen
            questions={questions}
            results={results}
            score={score}
            onRegister={handleRegistration}
            onSkip={() => setGameState("finished")}
            error={error}
          />
        )}

        {gameState === "finished" && (
          <FinishedScreen
            questions={questions}
            results={results}
            score={score}
            playerId={playerId}
            playerName={playerName}
            onLeaderboard={() => navigate("/leaderboard")}
            onPlayAgain={playAgain}
            hasPlayedGame={hasPlayedGame}
          />
        )}
      </div>
    </div>
  );
}
