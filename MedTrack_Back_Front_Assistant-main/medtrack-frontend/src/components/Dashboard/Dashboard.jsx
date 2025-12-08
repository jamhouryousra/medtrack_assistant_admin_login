import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    rendezvousJour: 0,
    confirmes: 0,
    patientsActifs: 0,
    nouveauxMois: 0,
    termines: 0
  });

  const [rendezvousJour, setRendezvousJour] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPatients();
    fetchMedecins();
    fetchRendezvousJour();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur patients:', error);
    }
  };

  const fetchMedecins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medecins');
      const data = await response.json();
      setMedecins(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur médecins:', error);
    }
  };

  const getPatientById = (id) => {
    return patients.find(p => p.id_patient === id);
  };

  const getMedecinById = (id) => {
    return medecins.find(m => m.id_med === id);
  };

  const fetchStats = async () => {
    try {
      const patientsResponse = await fetch('http://localhost:3000/api/patients');
      const patients = await patientsResponse.json();
      const patientsData = Array.isArray(patients) ? patients : patients.data || [];

      const rdvResponse = await fetch('http://localhost:3000/api/rendezvous');
      const rdvData = await rdvResponse.json();
      const rendezvous = Array.isArray(rdvData) ? rdvData : rdvData.data || [];

      const today = new Date().toISOString().split('T')[0];
      const rdvAujourdhui = rendezvous.filter(r => {
        const rdvDate = r.date_rdv?.split('T')[0];
        return rdvDate === today;
      });
      
      const confirmes = rdvAujourdhui.filter(r => 
        r.statut?.toLowerCase() === 'confirmé' || 
        r.statut?.toLowerCase() === 'planifie'
      ).length;
      
      const termines = rdvAujourdhui.filter(r => 
        r.statut?.toLowerCase() === 'termine'
      ).length;

      setStats({
        rendezvousJour: rdvAujourdhui.length,
        confirmes: confirmes,
        patientsActifs: patientsData.length,
        nouveauxMois: 0,
        termines: termines
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const fetchRendezvousJour = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rendezvous');
      const data = await response.json();
      const rendezvous = Array.isArray(data) ? data : data.data || [];
      
      const today = new Date().toISOString().split('T')[0];
      const rdvAujourdhui = rendezvous.filter(r => {
        const rdvDate = r.date_rdv?.split('T')[0];
        return rdvDate === today;
      });
      
      // TRIER par heure croissante (09:00 → 10:00 → 11:00...)
      const rdvTries = rdvAujourdhui.sort((a, b) => {
        const heureA = a.heure_debut || a.heure_rdv || '00:00:00';
        const heureB = b.heure_debut || b.heure_rdv || '00:00:00';
        return heureA.localeCompare(heureB);
      });
      
      setRendezvousJour(rdvTries.slice(0, 5));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getInitials = (fullName) => {
    const names = fullName.split(' ');
    return names.map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Accueil</h1>

      {/* Statistiques - 3 cards en ligne */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Rendez-vous du jour</span>
            <div className="stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="15" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M3 10h18M8 3v4M16 3v4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.rendezvousJour}</div>
          <div className="stat-footer stat-footer-green">
            {stats.confirmes} confirmés
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Patients actifs</span>
            <div className="stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.patientsActifs}</div>
          <div className="stat-footer">
            +{stats.nouveauxMois} ce mois
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Terminés aujourd'hui</span>
            <div className="stat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.termines}</div>
          <div className="stat-footer stat-footer-blue">
            Consultations terminées
          </div>
        </div>
      </div>

      {/* Rendez-vous du jour */}
      <div className="rendezvous-section">
        <h2 className="section-title">Rendez-vous du jour</h2>

        <div className="rendezvous-list">
          {rendezvousJour.length > 0 ? (
            rendezvousJour.map((rdv) => {
              const patient = getPatientById(rdv.id_patient);
              const medecin = getMedecinById(rdv.id_med);
              
              const patientNom = patient?.utilisateur?.nom || 'Patient';
              const patientPrenom = patient?.utilisateur?.prenom || 'Inconnu';
              
              const medecinNom = medecin?.utilisateur?.nom || 'Médecin';
              const medecinPrenom = medecin?.utilisateur?.prenom || '';
              const medecinSpecialite = medecin?.specialite || '';
              
              const heure = rdv.heure_debut || rdv.heure_rdv || '00:00';
              const heureFormatted = heure.substring(0, 5);
              
              const statutNormalise = rdv.statut?.toLowerCase() === 'planifie' ? 'confirmé' : rdv.statut?.toLowerCase();
              
              return (
                <div key={rdv.id_rdv} className="rendezvous-card">
                  <div className="rendezvous-patient">
                    <div className="patient-avatar-circle" style={{ background: '#4F7EFF' }}>
                      {getInitials(`${patientNom} ${patientPrenom}`)}
                    </div>
                    <div className="rendezvous-info">
                      <div className="rendezvous-patient-name">
                        {patientNom} {patientPrenom}
                      </div>
                      <div className="rendezvous-medecin">
                        Dr. {medecinNom} {medecinPrenom} {medecinSpecialite && `(${medecinSpecialite})`}
                      </div>
                    </div>
                  </div>

                  <div className="rendezvous-time">
                    <div className="time-value">{heureFormatted}</div>
                    <div 
                      className="rendezvous-status"
                      style={{ 
                        background: 
                          statutNormalise === 'confirmé' || statutNormalise === 'planifie' ? '#D1FAE5' :
                          statutNormalise === 'termine' ? '#DBEAFE' :
                          statutNormalise === 'annule' ? '#FEE2E2' :
                          '#FEF3C7',
                        color: 
                          statutNormalise === 'confirmé' || statutNormalise === 'planifie' ? '#065F46' :
                          statutNormalise === 'termine' ? '#1E40AF' :
                          statutNormalise === 'annule' ? '#991B1B' :
                          '#92400E'
                      }}
                    >
                      {statutNormalise === 'termine' ? 'terminé' :
                       statutNormalise === 'annule' ? 'annulé' :
                       statutNormalise || 'en-attente'}
                    </div>
                  </div>

                  <div className="rendezvous-check">
                    {(statutNormalise === 'confirmé' || statutNormalise === 'planifie') && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.1"/>
                        <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    {statutNormalise === 'termine' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#3B82F6" fillOpacity="0.1"/>
                        <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    {statutNormalise === 'annule' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#EF4444" fillOpacity="0.1"/>
                        <path d="M15 9l-6 6M9 9l6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Aucun rendez-vous
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;