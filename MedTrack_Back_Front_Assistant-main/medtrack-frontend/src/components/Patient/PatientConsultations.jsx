import React, { useState, useEffect } from 'react';
import './PatientConsultations.css';

const PatientConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const patientId = user?.id_patient;

  useEffect(() => {
    if (patientId) {
      fetchConsultations();
      fetchMedecins();
    }
  }, [patientId]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      console.log(' Récupération consultations pour patient:', patientId);
      
      const response = await fetch(`http://localhost:3000/api/consultations?id_patient=${patientId}`);
      const data = await response.json();
      
      console.log('Consultations reçues:', data);
      
      const consultationsData = Array.isArray(data) ? data : data.data || [];
      
      // Trier par date décroissante (plus récentes en premier)
      const consultationsTries = consultationsData.sort((a, b) => {
        return new Date(b.date_cons) - new Date(a.date_cons);
      });
      
      setConsultations(consultationsTries);
    } catch (error) {
      console.error(' Erreur consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedecins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medecins');
      const data = await response.json();
      setMedecins(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(' Erreur médecins:', error);
    }
  };

  const getMedecinById = (id) => {
    return medecins.find(m => m.id_med === id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConsultation(null);
  };

  return (
    <div className="patient-consultations-page">
      <div className="patient-consultations-header">
        <h1 className="patient-consultations-title">Mes Consultations</h1>
        <div className="patient-consultations-stats">
          <div className="stat-item">
            <span className="stat-number">{consultations.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="consultations-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des consultations...</p>
        </div>
      ) : consultations.length === 0 ? (
        <div className="consultations-empty">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#F3F4F6"/>
            <path d="M40 55h40M40 70h30" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="60" cy="40" r="8" fill="#9CA3AF"/>
          </svg>
          <h2>Aucune consultation</h2>
          <p>Vous n'avez pas encore de consultation enregistrée.</p>
        </div>
      ) : (
        <div className="consultations-grid">
          {consultations.map((consultation) => {
            const medecin = getMedecinById(consultation.id_med);
            const medecinNom = medecin?.utilisateur?.nom || 'Médecin';
            const medecinPrenom = medecin?.utilisateur?.prenom || 'Inconnu';
            const specialite = medecin?.specialite || '';

            return (
              <div key={consultation.id_cons} className="consultation-card">
                <div className="consultation-card-header">
                  <div className="consultation-date">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="4" width="14" height="14" rx="2" stroke="#6B7280" strokeWidth="1.5"/>
                      <path d="M3 8h14M7 2v4M13 2v4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{formatDate(consultation.date_cons)}</span>
                  </div>
                </div>

                <div className="consultation-card-body">
                  <div className="consultation-medecin">
                    <div className="medecin-avatar">
                      {medecinNom.charAt(0)}{medecinPrenom.charAt(0)}
                    </div>
                    <div className="medecin-info">
                      <h3>Dr. {medecinNom} {medecinPrenom}</h3>
                      {specialite && <p className="medecin-specialite">{specialite}</p>}
                    </div>
                  </div>

                  {consultation.compte_rendu && (
                    <div className="consultation-preview">
                      <p className="consultation-preview-label">Compte rendu :</p>
                      <p className="consultation-preview-text">
                        {consultation.compte_rendu.length > 150
                          ? `${consultation.compte_rendu.substring(0, 150)}...`
                          : consultation.compte_rendu}
                      </p>
                    </div>
                  )}
                </div>

                <div className="consultation-card-footer">
                  <button
                    className="btn-view-details"
                    onClick={() => handleViewDetails(consultation)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3.5C4.5 3.5 1.73 5.61 1 8.5c.73 2.89 3.5 5 7 5s6.27-2.11 7-5c-.73-2.89-3.5-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Voir détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Détails Consultation */}
      {showModal && selectedConsultation && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de la consultation</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <label>Date de consultation</label>
                <p>{formatDate(selectedConsultation.date_cons)}</p>
              </div>

              <div className="detail-section">
                <label>Médecin</label>
                <p>
                  Dr. {getMedecinById(selectedConsultation.id_med)?.utilisateur?.nom}{' '}
                  {getMedecinById(selectedConsultation.id_med)?.utilisateur?.prenom}
                  {getMedecinById(selectedConsultation.id_med)?.specialite && (
                    <span className="specialite-badge">
                      {getMedecinById(selectedConsultation.id_med).specialite}
                    </span>
                  )}
                </p>
              </div>

              <div className="detail-section">
                <label>Compte rendu</label>
                <div className="compte-rendu-content">
                  {selectedConsultation.compte_rendu || 'Aucun compte rendu disponible'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientConsultations;