import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "../contexts/AdminContext";
import { useTheme } from "../contexts/ThemeContext";
import { AdminSidebar } from "../components/AdminSidebar";
import {
  fetchQuestionById,
  updateQuestion,
  deleteQuestion,
  uploadImage,
} from "../lib/queries";
import { queryKeys } from "../lib/queryClient";

export function AdminEditQuestion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { adminProfile, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.question(id!),
    queryFn: () => fetchQuestionById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    questionText: "What best describes this email?",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctOption: "a" as "a" | "b" | "c" | "d" | "e",
    explanation: "",
    points: 10,
    difficulty: "medium" as "easy" | "medium" | "hard",
    timerDuration: 40,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        questionText:
          data.question.question_text || "What best describes this email?",
        optionA: data.question.option_a || "",
        optionB: data.question.option_b || "",
        optionC: data.question.option_c || "",
        optionD: data.question.option_d || "",
        optionE: data.question.option_e || "",
        correctOption: data.question.correct_option || "a",
        explanation: data.question.explanation || "",
        points: data.question.points,
        difficulty: data.question.difficulty || "medium",
        timerDuration: data.question.timer_duration || 40,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      let imageUrl = data?.question.email_image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "email-images");
      }

      await updateQuestion(id!, {
        email_image_url: imageUrl,
        question_text: updates.questionText,
        option_a: updates.optionA,
        option_b: updates.optionB,
        option_c: updates.optionC,
        option_d: updates.optionD,
        option_e: updates.optionE,
        correct_option: updates.correctOption,
        explanation: updates.explanation || null,
        points: updates.points,
        difficulty: updates.difficulty,
        timer_duration: updates.timerDuration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
      queryClient.invalidateQueries({ queryKey: queryKeys.question(id!) });
      setSuccess("Question updated successfully!");
      setError("");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update question");
      setSuccess("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuestion(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
      navigate("/admin/questions");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete question");
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this question? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading question...</div>;
  }

  if (!data) {
    return <div className="error-container">Question not found</div>;
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Edit Question</h1>
            <div className="header-actions">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
              <div className="admin-info">
                <span>Welcome, {adminProfile?.name}</span>
                <button
                  onClick={() => navigate("/admin/questions")}
                  className="nav-btn"
                >
                  Back to Questions
                </button>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="edit-question-container">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="question-form">
              <div className="current-image-section">
                <h3>Current Image</h3>
                <img
                  src={data.question.email_image_url}
                  alt="Current email"
                  className="current-image-preview"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="points">Points</label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timerDuration">Timer (seconds)</label>
                  <input
                    type="number"
                    id="timerDuration"
                    name="timerDuration"
                    value={formData.timerDuration}
                    onChange={handleInputChange}
                    min="5"
                    max="300"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageFile">Replace Image (Optional)</label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small className="form-hint">
                  Leave empty to keep current image
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="questionText">Question Text</label>
                <input
                  type="text"
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  placeholder="What best describes this email?"
                  required
                />
              </div>

              <div className="section-divider">
                <h3>Answer Options (All 5 Required)</h3>
              </div>

              <div className="form-group">
                <label htmlFor="optionA">Option A</label>
                <input
                  type="text"
                  id="optionA"
                  name="optionA"
                  value={formData.optionA}
                  onChange={handleInputChange}
                  placeholder="First option"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionB">Option B</label>
                <input
                  type="text"
                  id="optionB"
                  name="optionB"
                  value={formData.optionB}
                  onChange={handleInputChange}
                  placeholder="Second option"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionC">Option C</label>
                <input
                  type="text"
                  id="optionC"
                  name="optionC"
                  value={formData.optionC}
                  onChange={handleInputChange}
                  placeholder="Third option"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionD">Option D</label>
                <input
                  type="text"
                  id="optionD"
                  name="optionD"
                  value={formData.optionD}
                  onChange={handleInputChange}
                  placeholder="Fourth option"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionE">Option E</label>
                <input
                  type="text"
                  id="optionE"
                  name="optionE"
                  value={formData.optionE}
                  onChange={handleInputChange}
                  placeholder="Fifth option"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="correctOption">Correct Option</label>
                <select
                  id="correctOption"
                  name="correctOption"
                  value={formData.correctOption}
                  onChange={handleInputChange}
                  required
                >
                  <option value="a">Option A</option>
                  <option value="b">Option B</option>
                  <option value="c">Option C</option>
                  <option value="d">Option D</option>
                  <option value="e">Option E</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="explanation">Explanation (Optional)</label>
                <textarea
                  id="explanation"
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Question"}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-btn-large"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Question"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
