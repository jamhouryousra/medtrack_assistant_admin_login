import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import './MesRendezvous.css';

const MesRendezvous = () => {
  const [viewMode, setViewMode] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMedecinId = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.id_med || user.id;
    } catch (e) {
      console.error('Erreur parsing user:', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      const medecinId = getMedecinId();
      if (!medecinId) {
        setError('ID médecin non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3000/api/medecins/${medecinId}/rendezvous`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('La réponse n\'est pas du JSON');
        }
        
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateDuration = (heureDebut, heureFin) => {
    if (!heureDebut || !heureFin) return 0;
    const [hD, mD] = heureDebut.split(':').map(Number);
    const [hF, mF] = heureFin.split(':').map(Number);
    return (hF * 60 + mF) - (hD * 60 + mD);
  };

  const getStatusText = (statut) => {
    const statusMap = {
      'PLANIFIE': 'Planifié',
      'ANNULE': 'Annulé',
      'TERMINE': 'Terminé'
    };
    return statusMap[statut] || statut;
  };

  const getStatusClass = (statut) => {
    return statut.toLowerCase();
  };

  return (
    <div className="mes-rendez-vous">
      <div className="page-header">
        <h1>Mes rendez-vous</h1>
        <div className="header-actions">
          <button className="filter-btn">
            <Filter size={18} />
            Filtres
          </button>
          <div className="view-toggle">
            <button
              className={viewMode === 'calendar' ? 'active' : ''}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar size={18} />
              Calendrier
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Chargement des rendez-vous...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>Erreur: {error}</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="nav-btn"><ChevronLeft size={20} /></button>
            <h2>Janvier 2026</h2>
            <button className="nav-btn"><ChevronRight size={20} /></button>
          </div>
          <div className="calendar-grid">
            <div className="calendar-day-header">Lun</div>
            <div className="calendar-day-header">Mar</div>
            <div className="calendar-day-header">Mer</div>
            <div className="calendar-day-header">Jeu</div>
            <div className="calendar-day-header">Ven</div>
            <div className="calendar-day-header">Sam</div>
            <div className="calendar-day-header">Dim</div>
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className={`calendar-day ${i + 1 === 22 ? 'today' : ''}`}>
                <span className="day-number">{i + 1}</span>
                {i + 1 === 22 && appointments.length > 0 && (
                  <div className="day-appointments">
                    <span className="appointment-count">{appointments.length}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="list-view">
          <div className="appointments-list">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <p>Aucun rendez-vous trouvé</p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id_rdv} className="appointment-card">
                  <div className="appointment-time-col">
                    <Clock size={20} />
                    <span className="time">{formatTime(apt.heure_debut)}</span>
                    <span className="date">{formatDate(apt.date_rdv)}</span>
                    <span className="duration">{calculateDuration(apt.heure_debut, apt.heure_fin)} min</span>
                  </div>

                  <div className="appointment-details-col">
                    <div className="patient-info">
                      <User size={18} />
                      <div>
                        <h4>{apt.patient?.prenom} {apt.patient?.nom}</h4>
                        <span className="age">{calculateAge(apt.patient?.date_naissance)} ans</span>
                      </div>
                    </div>
                    {apt.patient?.telephone && (
                      <p className="patient-contact">📞 {apt.patient.telephone}</p>
                    )}
                    {apt.patient?.email && (
                      <p className="patient-contact">✉️ {apt.patient.email}</p>
                    )}
                  </div>

                  <div className="appointment-actions-col">
                    <span className={`status-badge ${getStatusClass(apt.statut)}`}>
                      {getStatusText(apt.statut)}
                    </span>
                    <button className="btn-view">Voir détails</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MesRendezvous;