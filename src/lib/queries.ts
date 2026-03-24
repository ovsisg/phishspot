import { supabase } from "./supabase";
import type { Question } from "./supabase";

// Fetch all questions
export const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch single question
export const fetchQuestionById = async (id: string): Promise<Question> => {
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (questionError) throw questionError;
  return question;
};

// Create question
export const createQuestion = async (questionData: {
  created_by?: string;
  question_type: "phishing" | "no_phishing";
  email_image_url: string;
  correct_answer: boolean;
  explanation?: string;
  points: number;
  difficulty?: "easy" | "medium" | "hard";
  is_active: boolean;
}) => {
  const { data, error } = await supabase
    .from("questions")
    .insert(questionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update question
export const updateQuestion = async (
  id: string,
  updates: Partial<Omit<Question, "id" | "created_at" | "updated_at">>,
) => {
  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete question
export const deleteQuestion = async (id: string) => {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
};

// Upload image to storage
export const uploadImage = async (
  file: File,
  bucketName: "phishing-emails" | "no-phishing-emails" | "email-images",
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};
