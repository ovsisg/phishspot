import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Game } from './pages/Game';
import { Leaderboard } from './pages/Leaderboard';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminQuestions } from './pages/AdminQuestions';
import { AdminEditQuestion } from './pages/AdminEditQuestion';
import { queryClient } from './lib/queryClient';
import './App.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AdminProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              {/* Admin routes - hidden from public navigation */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <PrivateRoute>
                    <AdminQuestions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/questions/:id"
                element={
                  <PrivateRoute>
                    <AdminEditQuestion /> 
                  </PrivateRoute>
                }
              />
            </Routes>
          </AdminProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
