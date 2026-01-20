import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PatientSidebar.css';

const PatientSidebar = () => {
  const location = useLocation();

  return (
    <div className="patient-sidebar">
      {/* Logo */}
      <div className="patient-sidebar-logo">
        <div className="patient-logo-icon">
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
        <h1 className="patient-logo-text">MedTrack</h1>
      </div>

      {/* Menu Items */}
      <nav className="patient-sidebar-menu">
        <Link
          to="/patient/dashboard"
          className={`patient-menu-item ${location.pathname === '/patient/dashboard' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="patient-menu-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="patient-menu-label">Accueil</span>
        </Link>

        <Link
          to="/patient/appointments"
          className={`patient-menu-item ${location.pathname === '/patient/appointments' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="patient-menu-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="patient-menu-label">Mes rendez-vous</span>
        </Link>

        <Link
          to="/patient/analyses"
          className={`patient-menu-item ${location.pathname === '/patient/analyses' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="patient-menu-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="patient-menu-label">Analyses médicales</span>
        </Link>

        <Link
          to="/patient/consultations"
          className={`patient-menu-item ${location.pathname === '/patient/consultations' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="patient-menu-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="patient-menu-label">Consultations passées</span>
        </Link>

        <Link
          to="/patient/profile"
          className={`patient-menu-item ${location.pathname === '/patient/profile' ? 'active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="patient-menu-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="patient-menu-label">Mon profil</span>
        </Link>
      </nav>
    </div>
  );
};

export default PatientSidebar;