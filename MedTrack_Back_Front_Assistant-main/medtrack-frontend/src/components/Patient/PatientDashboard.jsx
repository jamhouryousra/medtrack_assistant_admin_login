import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    prochainsRdv: 0,
    rdvConfirmes: 0,
    analysesDisponibles: 0,
    derniereConsultation: null
  });

  const [prochainsRendezvous, setProchainsRendezvous] = useState([]);
  const [medecins, setMedecins] = useState([]);

  // Récupérer l'ID du patient connecté
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const patientId = user?.id_patient;

  useEffect(() => {
    if (patientId) {
      fetchStats();
      fetchMedecins();
      fetchProchainsRendezvous();
    }
  }, [patientId]);

  const fetchMedecins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medecins');
      const data = await response.json();
      setMedecins(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur médecins:', error);
    }
  };

  const getMedecinById = (id) => {
    return medecins.find(m => m.id_med === id);
  };

  const fetchStats = async () => {
    try {
      // Récupérer les rendez-vous du patient
      const rdvResponse = await fetch('http://localhost:3000/api/rendezvous');
      const rdvData = await rdvResponse.json();
      const rendezvous = Array.isArray(rdvData) ? rdvData : rdvData.data || [];

      // Filtrer les RDV du patient
      const mesRdv = rendezvous.filter(r => r.id_patient === patientId);

      // RDV à venir (date >= aujourd'hui ET non annulés)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const rdvAvenir = mesRdv.filter(r => {
        const rdvDate = new Date(r.date_rdv);
        rdvDate.setHours(0, 0, 0, 0);
        // ✅ Exclure les RDV annulés
        return rdvDate >= today && r.statut?.toLowerCase() !== 'annule';
      });

      const rdvConfirmes = rdvAvenir.filter(r => 
        r.statut?.toLowerCase() === 'confirmé' || 
        r.statut?.toLowerCase() === 'planifie'
      ).length;

      // Dernière consultation (RDV passés, terminés OU auto-terminés)
      const rdvPasses = mesRdv.filter(r => {
        const rdvDate = new Date(r.date_rdv);
        rdvDate.setHours(0, 0, 0, 0);
        const statut = r.statut?.toLowerCase();
        
        // ✅ Inclure les RDV passés terminés OU les RDV passés confirmés (auto-terminés)
        return rdvDate < today && 
               (statut === 'termine' || statut === 'planifie' || statut === 'confirmé') &&
               statut !== 'annule';
      });

      const dernierRdv = rdvPasses.sort((a, b) => 
        new Date(b.date_rdv) - new Date(a.date_rdv)
      )[0];

      setStats({
        prochainsRdv: rdvAvenir.length,
        rdvConfirmes: rdvConfirmes,
        analysesDisponibles: 2, // À adapter selon vos données
        derniereConsultation: dernierRdv?.date_rdv || null
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const fetchProchainsRendezvous = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rendezvous');
      const data = await response.json();
      const rendezvous = Array.isArray(data) ? data : data.data || [];

      // Filtrer les RDV du patient + futurs + non annulés
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mesRdvFuturs = rendezvous.filter(r => {
        const rdvDate = new Date(r.date_rdv);
        rdvDate.setHours(0, 0, 0, 0);
        // ✅ Exclure les RDV annulés
        return r.id_patient === patientId && 
               rdvDate >= today && 
               r.statut?.toLowerCase() !== 'annule';
      });

      // Trier par date croissante
      const rdvTries = mesRdvFuturs.sort((a, b) => 
        new Date(a.date_rdv) - new Date(b.date_rdv)
      );

      setProchainsRendezvous(rdvTries.slice(0, 3));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="patient-dashboard-page">
      <h1 className="patient-dashboard-title">Mon espace patient</h1>

      {/* Bannière de bienvenue */}
      <div className="patient-welcome-banner">
        <h2 className="patient-welcome-title">
          Bienvenue, {user?.prenom} {user?.nom}
        </h2>
        <p className="patient-welcome-subtitle">
          Gérez vos rendez-vous, consultations et analyses médicales en un seul endroit
        </p>
      </div>

      {/* Statistiques - 3 cards */}
      <div className="patient-stats-grid">
        <div className="patient-stat-card">
          <div className="patient-stat-header">
            <span className="patient-stat-label">Prochains RDV</span>
            <div className="patient-stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="15" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M3 10h18M8 3v4M16 3v4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="patient-stat-number">{stats.prochainsRdv}</div>
          <div className="patient-stat-footer patient-stat-footer-green">
            Confirmés
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-header">
            <span className="patient-stat-label">Analyses disponibles</span>
            <div className="patient-stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#9CA3AF" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" stroke="#9CA3AF" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="patient-stat-number">{stats.analysesDisponibles}</div>
          <div className="patient-stat-footer">
            À consulter
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-header">
            <span className="patient-stat-label">Dernière consultation</span>
            <div className="patient-stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 16h5l2.5-5 5 10 2.5-5h5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="patient-stat-number" style={{ fontSize: '20px' }}>
            {stats.derniereConsultation ? formatDateShort(stats.derniereConsultation) : 'Aucune'}
          </div>
          <div className="patient-stat-footer patient-stat-footer-blue">
            {stats.derniereConsultation ? '2025' : ''}
          </div>
        </div>
      </div>

      {/* Rendez-vous à venir */}
      <div className="patient-rdv-section">
        <h2 className="patient-section-title">Rendez-vous à venir</h2>

        <div className="patient-rdv-list">
          {prochainsRendezvous.length > 0 ? (
            prochainsRendezvous.map((rdv) => {
              const medecin = getMedecinById(rdv.id_med);
              const medecinNom = medecin?.utilisateur?.nom || 'Médecin';
              const medecinPrenom = medecin?.utilisateur?.prenom || '';
              const specialite = medecin?.specialite || 'Consultation';
              const heure = rdv.heure_debut || rdv.heure_rdv || '00:00';
              const heureFormatted = heure.substring(0, 5);

              return (
                <div key={rdv.id_rdv} className="patient-rdv-card">
                  <div className="patient-rdv-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="15" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M3 10h18M8 3v4M16 3v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="patient-rdv-info">
                    <div className="patient-rdv-doctor">
                      Dr. {medecinNom} {medecinPrenom}
                    </div>
                    <div className="patient-rdv-type">{specialite}</div>
                  </div>
                  <div className="patient-rdv-datetime">
                    <div className="patient-rdv-date">{formatDate(rdv.date_rdv)}</div>
                    <div className="patient-rdv-time">{heureFormatted}</div>
                  </div>
                  <button className="patient-rdv-link">À propos</button>
                </div>
              );
            })
          ) : (
            <div className="patient-empty-state">
              <p>Aucun rendez-vous à venir</p>
            </div>
          )}
        </div>
      </div>

      {/* Mes analyses médicales */}
      <div className="patient-analyses-section">
        <h2 className="patient-section-title">Mes analyses médicales</h2>

        <div className="patient-analyses-dashboard-list">
          {/* Analyse sanguine */}
          <div className="patient-analyse-dashboard-card">
            <div className="patient-analyse-dashboard-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4F7EFF" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" stroke="#4F7EFF" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="#4F7EFF" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="#4F7EFF" strokeWidth="2"/>
              </svg>
            </div>
            <div className="patient-analyse-dashboard-info">
              <div className="patient-analyse-dashboard-name">Analyse sanguine</div>
              <div className="patient-analyse-dashboard-date">2025-09-20</div>
            </div>
            <button className="patient-analyse-dashboard-btn">Télécharger</button>
          </div>

          {/* Radiographie thorax */}
          <div className="patient-analyse-dashboard-card">
            <div className="patient-analyse-dashboard-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4F7EFF" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" stroke="#4F7EFF" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="#4F7EFF" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="#4F7EFF" strokeWidth="2"/>
              </svg>
            </div>
            <div className="patient-analyse-dashboard-info">
              <div className="patient-analyse-dashboard-name">Radiographie thorax</div>
              <div className="patient-analyse-dashboard-date">2025-08-10</div>
            </div>
            <button className="patient-analyse-dashboard-btn">Télécharger</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;