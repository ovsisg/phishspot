import { useNavigate, useLocation } from 'react-router-dom';

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Admin Panel</h2>
        
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </button>
          
          <button
            className={`sidebar-link ${isActive('/admin/questions') ? 'active' : ''}`}
            onClick={() => navigate('/admin/questions')}
          >
            <span className="sidebar-icon">📝</span>
            <span>All Questions</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
