import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  country: string;
  email?: string;
  phone?: string;
  company?: string;
  additional_info?: string;
  role: 'admin' | 'player';
  total_games_played: number;
  best_score: number;
  total_score: number;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  created_by?: string;
  email_image_url: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: 'a' | 'b' | 'c' | 'd' | 'e';
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  timer_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields (kept for backward compatibility)
  question_type?: 'phishing' | 'no_phishing';
  correct_answer?: boolean;
};

export type FollowupQuestion = {
  id: string;
  question_id: string;
  followup_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};
