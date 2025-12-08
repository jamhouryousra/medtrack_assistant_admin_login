import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4F7EFF"/>
            <path 
              d="M4 16h5l2.5-5 5 10 2.5-5h5"
              stroke="white" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h1 className="logo-text">MedTrack</h1>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        <Link
          to="/dashboard"
          className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="menu-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="menu-label">Accueil</span>
        </Link>

        <Link
          to="/patients"
          className={`menu-item ${location.pathname === '/patients' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="menu-icon">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="menu-label">Patients</span>
        </Link>

        <Link
          to="/rendezvous"
          className={`menu-item ${location.pathname === '/rendezvous' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="menu-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="menu-label">Rendez-vous</span>
        </Link>

        <Link
          to="/profil"
          className={`menu-item ${location.pathname === '/profil' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="menu-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="menu-label">Profil</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
