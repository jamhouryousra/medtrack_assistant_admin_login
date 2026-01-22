import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import './MedecinHeader.css';

const MedecinHeader = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    }
    return 'DM';
  };

  return (
    <header className="medecin-header">
      <div className="header-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button 
          className="notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-info">
          <div className="user-avatar">
            {getInitials()}
          </div>
          <div className="user-details">
            <span className="user-name">
              {user?.prenom} {user?.nom}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notification-item">
            <p>Nouveau rendez-vous créé</p>
            <span>Il y a 5 minutes</span>
          </div>
          <div className="notification-item">
            <p>Rendez-vous modifié</p>
            <span>Il y a 1 heure</span>
          </div>
          <div className="notification-item">
            <p>Nouveau patient enregistré</p>
            <span>Il y a 2 heures</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default MedecinHeader;