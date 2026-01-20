import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4F7EFF"/>
              <path d="M10 20h6l3-6 6 12 3-6h6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="admin-logo-text">MedTrack</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${isActive('/admin') || isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Tableau de bord</span>
          </button>

          <button
            className={`admin-nav-item ${isActive('/admin/medecins') ? 'active' : ''}`}
            onClick={() => navigate('/admin/medecins')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 11v4M8 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 18a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Gestion Médecin</span>
          </button>

          <button
            className={`admin-nav-item ${isActive('/admin/assistants') ? 'active' : ''}`}
            onClick={() => navigate('/admin/assistants')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 18a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Gestion Assistant</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search-container">
            <svg className="admin-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M14 14l4 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Rechercher un médecin, une analyse..." className="admin-search-input" />
          </div>

          <div className="admin-header-right">
            <div className="admin-user-profile">
              <div className="admin-user-avatar">
                {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
              </div>
              <div className="admin-user-info">
                <div className="admin-user-name">{user.prenom} {user.nom}</div>
                <div className="admin-user-role">Administrateur</div>
              </div>
            </div>

            <button className="admin-btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}