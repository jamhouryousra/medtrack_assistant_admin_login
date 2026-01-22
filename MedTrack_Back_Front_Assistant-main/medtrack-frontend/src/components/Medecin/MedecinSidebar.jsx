import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Brain,
  UserCircle,
  LogOut 
} from 'lucide-react';
import './MedecinSidebar.css';

const MedecinSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="medecin-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#3b82f6"/>
            <path d="M16 8L16 24M8 16L24 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-text">MedTrack</span>
        <span className="role-badge medecin">Médecin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/medecin/dashboard" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink 
          to="/medecin/rendez-vous" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Calendar size={20} />
          <span>Mes rendez-vous</span>
        </NavLink>

        <NavLink 
          to="/medecin/patients" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Users size={20} />
          <span>Mes patients</span>
        </NavLink>

        <NavLink 
          to="/medecin/consultations" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <FileText size={20} />
          <span>Consultations</span>
        </NavLink>

        <NavLink 
          to="/medecin/predictions-ia" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Brain size={20} />
          <span>Prédictions IA</span>
          <span className="beta-badge">BETA</span>
        </NavLink>

        <div className="nav-divider"></div>

        <NavLink 
          to="/medecin/profil" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <UserCircle size={20} />
          <span>Mon profil</span>
        </NavLink>

        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="quick-stats">
          <div className="quick-stat-item">
            <span className="stat-label">Aujourd'hui</span>
            <span className="stat-value">12 RDV</span>
          </div>
          <div className="quick-stat-item">
            <span className="stat-label">En attente</span>
            <span className="stat-value">3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedecinSidebar;