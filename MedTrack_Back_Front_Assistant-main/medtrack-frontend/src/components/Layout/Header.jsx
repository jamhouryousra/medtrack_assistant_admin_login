import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext'; // ← AJOUTÉ
import './Header.css';

const Header = ({ title, user }) => {
  const navigate = useNavigate();
  const [rdvCount, setRdvCount] = useState(0);
  const { refreshTrigger } = useNotifications(); // ← AJOUTÉ

  //  Se déclenche au montage ET quand refreshTrigger change
  useEffect(() => {
    fetchRdvCount();
  }, [refreshTrigger]);

  const fetchRdvCount = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rendezvous');
      const data = await response.json();
      const rendezvous = Array.isArray(data) ? data : data.data || [];
      
      // Compter les RDV d'aujourd'hui (SANS les annulés)
      const today = new Date().toISOString().split('T')[0];
      const rdvToday = rendezvous.filter(r => {
        const rdvDate = r.date_rdv?.split('T')[0];
        return rdvDate === today && r.statut?.toUpperCase() !== 'ANNULE'; // ← AJOUTÉ
      });
      
      setRdvCount(rdvToday.length);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Barre de recherche */}
      <div className="search-container">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Rechercher un patient..."
        />
      </div>

      {/* Notifications et Profil */}
      <div className="header-actions">
        {/* Notifications */}
        <button 
          className="notification-btn"
          onClick={() => navigate('/rendezvous')}
          title={`${rdvCount} rendez-vous aujourd'hui`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
            <path 
              d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" 
              stroke="#6B7280" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42116 18.2537 9.16816 18.1079C8.91515 17.9622 8.70486 17.7526 8.55835 17.5" 
              stroke="#6B7280" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {rdvCount > 0 && (
            <span className="notification-badge">{rdvCount}</span>
          )}
        </button>

        {/* Profil utilisateur */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.prenom} {user?.nom}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>

        {/* Bouton Déconnexion */}
        <button className="btn-logout-header" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;