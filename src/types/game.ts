import type { Question } from "../lib/supabase";

// Removed 'followup' state - questions now have options built-in
export type GameState =
  | "idle"
  | "loading"
  | "playing"
  | "answered"
  | "finished"
  | "registration";

// No longer need QuestionWithFollowup - use Question directly
export type GameQuestion = Question;

export interface GameResult {
  questionId: string;
  selectedOption: "a" | "b" | "c" | "d" | "e" | null; // null if timeout
  correct: boolean;
  points: number;
  timeSpent: number;
  timeBonus?: number;
}

// Helper type for randomised options
export interface RandomisedOption {
  key: "a" | "b" | "c" | "d" | "e";
  text: string;
}
