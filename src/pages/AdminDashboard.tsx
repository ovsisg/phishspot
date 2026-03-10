import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { supabase } from '../lib/supabase';
import type { Question } from '../lib/supabase';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { adminProfile, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    imageFile: null as File | null,
    questionText: 'What best describes this email?',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    optionE: '',
    correctOption: 'a' as 'a' | 'b' | 'c' | 'd' | 'e',
    explanation: '',
    points: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    timerDuration: 40,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };

  const uploadImage = async (file: File, bucketName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.imageFile) {
        setError('Please select an image file');
        setIsLoading(false);
        return;
      }

      // Validate all 5 options are filled
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD || !formData.optionE) {
        setError('Please fill in all 5 options');
        setIsLoading(false);
        return;
      }

      // Upload to email-images bucket
      const imageUrl = await uploadImage(formData.imageFile, 'email-images');
      
      if (!imageUrl) {
        setError('Failed to upload image');
        setIsLoading(false);
        return;
      }

      // Insert question with new multiple choice format
      // Note: question_type and correct_answer are legacy fields kept for backward compatibility
      const { error: questionError } = await supabase
        .from('questions')
        .insert({
          created_by: adminProfile?.id,
          email_image_url: imageUrl,
          question_type: 'phishing', // Legacy field - kept for backward compatibility
          correct_answer: true,      // Legacy field - kept for backward compatibility
          question_text: formData.questionText,
          option_a: formData.optionA,
          option_b: formData.optionB,
          option_c: formData.optionC,
          option_d: formData.optionD,
          option_e: formData.optionE,
          correct_option: formData.correctOption,
          explanation: formData.explanation || null,
          points: formData.points,
          difficulty: formData.difficulty,
          timer_duration: formData.timerDuration,
          is_active: true,
        });

      if (questionError) throw questionError;

      setSuccess('Question created successfully!');
      setFormData({
        imageFile: null,
        questionText: 'What best describes this email?',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE: '',
        correctOption: 'a',
        explanation: '',
        points: 10,
        difficulty: 'medium',
        timerDuration: 40,
      });
      
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await loadQuestions();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="admin-main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 
              className="dashboard-title-clickable"
              onClick={() => navigate('/admin/dashboard')}
            >
              Admin Dashboard
            </h1>
            <div className="header-actions">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <div className="admin-info">
                <span>Welcome, {adminProfile?.name}</span>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="create-question-section">
            <h2>Create New Question</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="question-form">
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
                <label htmlFor="imageFile">Email Image</label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <small className="form-hint">
                  Will be uploaded to email-images bucket
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

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Creating Question...' : 'Create Question'}
              </button>
            </form>
          </section>

          <section className="questions-list-section">
            <div className="section-header">
              <h2>Latest Questions</h2>
              <button 
                onClick={() => navigate('/admin/questions')}
                className="view-all-btn"
              >
                View All →
              </button>
            </div>
            <div className="questions-list">
              {questions.slice(0, 3).map((question) => (
                <div 
                  key={question.id} 
                  className="question-card question-card-clickable"
                  onClick={() => navigate(`/admin/questions/${question.id}`)}
                >
                  <div className="question-header">
                    <span className={`question-type ${question.correct_option ? 'new-format' : 'legacy'}`}>
                      {question.correct_option ? '📝 Multiple Choice' : '⚠️ Legacy Format'}
                    </span>
                    <span className="question-difficulty">{question.difficulty}</span>
                  </div>
                  <img src={question.email_image_url} alt="Email preview" className="question-image" />
                  <div className="question-details">
                    <p><strong>Points:</strong> {question.points}</p>
                    {question.question_text && (
                      <p className="question-text-preview">
                        {question.question_text.substring(0, 60)}
                        {question.question_text.length > 60 ? '...' : ''}
                      </p>
                    )}
                    {question.correct_option && (
                      <p><strong>Correct:</strong> Option {question.correct_option.toUpperCase()}</p>
                    )}
                  </div>
                  <div className="card-footer">
                    <span className="click-hint">Click to edit →</span>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="no-questions">No questions yet. Create your first one above!</p>
              )}
            </div>
          </section>
        </div>
      </main>
      </div>
    </div>
  );
}
