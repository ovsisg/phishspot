import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { fetchQuestions } from '../lib/queries';
import { queryKeys } from '../lib/queryClient';

export function AdminQuestions() {
  const { adminProfile, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: queryKeys.questions,
    queryFn: fetchQuestions,
  });

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      
      <div className="admin-main-content">
        <header className="dashboard-header">
        <div className="header-content">
          <h1>All Questions</h1>
          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <div className="admin-info">
              <span>Welcome, {adminProfile?.name}</span>
              <button onClick={() => navigate('/admin/dashboard')} className="nav-btn">
                Dashboard
              </button>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="questions-grid-container">
          {isLoading && <p>Loading questions...</p>}
          {error && <div className="error-message">Error loading questions</div>}
          
          {!isLoading && !error && questions.length === 0 && (
            <p className="no-questions">No questions found. Create one from the dashboard!</p>
          )}

          <div className="questions-grid">
            {questions.map((question) => (
              <div 
                key={question.id} 
                className="question-card-clickable"
                onClick={() => navigate(`/admin/questions/${question.id}`)}
              >
                <div className="question-header">
                  <span className={`question-type ${question.question_type}`}>
                    {question.question_type === 'phishing' ? '⚠️ Phishing' : '✅ Legitimate'}
                  </span>
                  <span className="question-difficulty">{question.difficulty}</span>
                </div>
                
                <img 
                  src={question.email_image_url} 
                  alt="Email preview" 
                  className="question-image" 
                />
                
                <div className="question-details">
                  <p><strong>Points:</strong> {question.points}</p>
                  {question.explanation && (
                    <p className="explanation-preview">
                      {question.explanation.substring(0, 100)}
                      {question.explanation.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
                
                <div className="card-footer">
                  <span className="click-hint">Click to edit →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
