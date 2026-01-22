import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock } from 'lucide-react';
import './MedecinDashboard.css';

const MedecinDashboard = () => {
  const [stats, setStats] = useState({
    consultationsToday: 0,
    totalPatients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMedecinId = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.id_med || user.id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const medecinId = getMedecinId();
      if (!medecinId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get TODAY's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's appointments with date filter
        const rdvResponse = await fetch(
          `http://localhost:3000/api/medecins/${medecinId}/rendezvous?date=${today}`
        );
        
        if (rdvResponse.ok) {
          const rdvData = await rdvResponse.json();
          setTodayAppointments(Array.isArray(rdvData) ? rdvData : []);
          setStats(prev => ({
            ...prev,
            consultationsToday: rdvData.length || 0
          }));
        }

        // Fetch total patients
        const patientsResponse = await fetch(
          `http://localhost:3000/api/medecins/${medecinId}/dossiers`
        );
        
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setStats(prev => ({
            ...prev,
            totalPatients: Array.isArray(patientsData) ? patientsData.length : 0
          }));
        }

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const getStatusColor = (statut) => {
    const colors = {
      'PLANIFIE': '#3b82f6',
      'EN_COURS': '#10b981',
      'TERMINE': '#6b7280',
      'ANNULE': '#ef4444'
    };
    return colors[statut] || '#6b7280';
  };

  const getStatusText = (statut) => {
    const texts = {
      'PLANIFIE': 'Confirmé',
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return texts[statut] || statut;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const userName = JSON.parse(localStorage.getItem('user') || '{}').nom || 'Médical';

  return (
    <div className="medecin-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p className="subtitle">Bienvenue, Dr. {userName}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Calendar size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Consultations aujourd'hui</p>
            <h3 className="stat-value">{stats.consultationsToday}</h3>
            <span className="stat-trend positive">Aujourd'hui</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
            <Users size={24} color="#10b981" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total patients</p>
            <h3 className="stat-value">{stats.totalPatients}</h3>
            <span className="stat-trend positive">Vos patients</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FileText size={24} color="#f59e0b" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Taux de complétion</p>
            <h3 className="stat-value">87%</h3>
            <span className="stat-trend positive">+3% ce mois</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <Clock size={24} color="#6366f1" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Temps moyen</p>
            <h3 className="stat-value">22 min</h3>
            <span className="stat-trend neutral">= moyenne</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="planning-section">
          <div className="section-header">
            <h2>Planning du jour</h2>
            <span className="current-time">Maintenant: {getCurrentTime()}</span>
          </div>

          {loading ? (
            <div className="loading-state"><p>Chargement...</p></div>
          ) : todayAppointments.length === 0 ? (
            <div className="empty-state"><p>Aucun rendez-vous aujourd'hui</p></div>
          ) : (
            <div className="timeline">
              {todayAppointments.map((apt) => (
                <div 
                  key={apt.id_rdv} 
                  className={`appointment-block ${apt.statut.toLowerCase()}`}
                  style={{ borderLeftColor: getStatusColor(apt.statut) }}
                >
                  <div className="appointment-time">
                    <span className="time">{formatTime(apt.heure_debut)}</span>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(apt.statut) }}>
                      {getStatusText(apt.statut)}
                    </span>
                  </div>

                  <div className="appointment-content">
                    <div className="patient-info">
                      <h4>{apt.patient?.prenom} {apt.patient?.nom}</h4>
                      <span className="patient-age">{calculateAge(apt.patient?.date_naissance)} ans</span>
                    </div>

                    <p className="appointment-reason">Consultation</p>

                    {apt.patient?.telephone && (
                      <div className="appointment-details">
                        <div className="detail-item">
                          <span className="detail-label">Tél:</span>
                          <span>{apt.patient.telephone}</span>
                        </div>
                      </div>
                    )}

                    <div className="appointment-actions">
                      <button 
                        className="btn-primary"
                        disabled={apt.statut === 'TERMINE' || apt.statut === 'ANNULE'}
                      >
                        Démarrer consultation
                      </button>
                      <button className="btn-secondary">
                        Ouvrir dossier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="patients-today">
            <h3>Patients du jour ({todayAppointments.length})</h3>
            <div className="patients-list">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id_rdv} className="patient-item">
                  <div className="patient-header">
                    <span className="patient-time">{formatTime(apt.heure_debut)}</span>
                    {apt.statut === 'EN_COURS' ? (
                      <span className="status-indicator active">●</span>
                    ) : apt.statut === 'PLANIFIE' ? (
                      <span className="status-indicator">○</span>
                    ) : (
                      <span className="status-indicator completed">✓</span>
                    )}
                  </div>
                  <p className="patient-name">{apt.patient?.prenom} {apt.patient?.nom}</p>
                  <p className="patient-reason">Consultation</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedecinDashboard;