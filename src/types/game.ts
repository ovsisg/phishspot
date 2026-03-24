import type { Question } from "../lib/supabase";

export type GameState =
  | "idle"
  | "loading"
  | "playing"
  | "answered"
  | "finished"
  | "saveScore";

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
