import React, { useState, useEffect } from 'react';
import './PatientAnalyses.css';

const PatientAnalyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [loading, setLoading] = useState(true);

  // Récupérer l'ID du patient connecté
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const patientId = user?.id_patient;

  useEffect(() => {
    if (patientId) {
      fetchAnalyses();
    }
  }, [patientId]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/analyses?id_patient=${patientId}`);
      const data = await response.json();
      
      // Trier par date décroissante (plus récentes en premier)
      const analysesTries = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.date_analyse) - new Date(a.date_analyse))
        : [];
      
      setAnalyses(analysesTries);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleTelecharger = async (analyse) => {
    if (!analyse.fichier_pdf) {
      alert('Aucun fichier PDF disponible pour cette analyse');
      return;
    }

    // Marquer l'analyse comme consultée
    try {
      await fetch(`http://localhost:3000/api/analyses/${analyse.id_analyse}/consulte`, {
        method: 'POST'
      });
      
      // Recharger les analyses pour mettre à jour le statut
      fetchAnalyses();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }

    // Téléchargement simulé
    alert(`Téléchargement de ${analyse.fichier_pdf}`);
    // TODO: Implémenter le téléchargement réel du PDF
    // window.open(`http://localhost:3000/uploads/analyses/${analyse.fichier_pdf}`, '_blank');
  };

  const handleVoir = async (analyse) => {
    // Marquer comme consultée
    if (analyse.statut === 'DISPONIBLE') {
      try {
        await fetch(`http://localhost:3000/api/analyses/${analyse.id_analyse}/consulte`, {
          method: 'POST'
        });
        fetchAnalyses();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }

    // Afficher les détails
    alert(`Résultats:\n\n${analyse.resultat || 'Aucun résultat disponible'}\n\nCommentaire:\n${analyse.commentaire || 'Aucun commentaire'}`);
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      'SANGUINE': 'Analyse sanguine',
      'URINAIRE': 'Analyse urinaire',
      'RADIOLOGIE': 'Radiologie',
      'SCANNER': 'Scanner',
      'IRM': 'IRM',
      'ECHOGRAPHIE': 'Échographie',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  };

  const getStatutClass = (statut) => {
    if (statut === 'DISPONIBLE') return 'patient-analyse-status-disponible';
    if (statut === 'EN_ATTENTE') return 'patient-analyse-status-attente';
    if (statut === 'CONSULTE') return 'patient-analyse-status-consulte';
    return '';
  };

  const getStatutLabel = (statut) => {
    if (statut === 'DISPONIBLE') return 'Disponible';
    if (statut === 'EN_ATTENTE') return 'En attente';
    if (statut === 'CONSULTE') return 'Consulté';
    return statut;
  };

  const getStatutIcon = (statut) => {
    if (statut === 'DISPONIBLE') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.1"/>
          <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (statut === 'EN_ATTENTE') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#F59E0B" fillOpacity="0.1"/>
          <path d="M12 6v6l4 2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (statut === 'CONSULTE') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" fillOpacity="0.1"/>
          <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  // Filtrer les analyses par statut
  const analysesFiltrees = analyses.filter(analyse => {
    if (filtreStatut === 'tous') return true;
    if (filtreStatut === 'disponible') return analyse.statut === 'DISPONIBLE';
    if (filtreStatut === 'attente') return analyse.statut === 'EN_ATTENTE';
    if (filtreStatut === 'consulte') return analyse.statut === 'CONSULTE';
    return false;
  });

  if (loading) {
    return (
      <div className="patient-analyses-page">
        <h1 className="patient-analyses-title">Analyses médicales</h1>
        <div className="patient-analyses-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="patient-analyses-page">
      <div className="patient-analyses-header">
        <h1 className="patient-analyses-title">Analyses médicales</h1>
        <div className="patient-analyses-count">
          {analyses.length} analyse{analyses.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtres */}
      <div className="patient-analyses-filters">
        <span className="patient-filter-label">Filtrer par statut :</span>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'tous' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('tous')}
        >
          Tous
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'disponible' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('disponible')}
        >
          Disponibles
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'attente' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('attente')}
        >
          En attente
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'consulte' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('consulte')}
        >
          Consultés
        </button>
      </div>

      {/* Grille des analyses */}
      <div className="patient-analyses-grid">
        {analysesFiltrees.length > 0 ? (
          analysesFiltrees.map((analyse) => (
            <div key={analyse.id_analyse} className="patient-analyse-card">
              <div className="patient-analyse-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4F7EFF" strokeWidth="2"/>
                  <polyline points="14 2 14 8 20 8" stroke="#4F7EFF" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="#4F7EFF" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="#4F7EFF" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="patient-analyse-content">
                <h3 className="patient-analyse-name">{analyse.nom_analyse}</h3>
                
                <div className="patient-analyse-type">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6B7280" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="#6B7280" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="#6B7280" strokeWidth="2"/>
                  </svg>
                  {getTypeLabel(analyse.type_analyse)}
                </div>

                <div className="patient-analyse-info-row">
                  <div className="patient-analyse-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="15" rx="2" stroke="#6B7280" strokeWidth="2"/>
                      <path d="M3 10h18M8 3v4M16 3v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="patient-analyse-date-label">Analyse :</span>
                    <span className="patient-analyse-date-value">{formatDateShort(analyse.date_analyse)}</span>
                  </div>
                  
                  {analyse.date_resultat && (
                    <div className="patient-analyse-date">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2"/>
                        <path d="M9 12l2 2 4-4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="patient-analyse-date-label">Résultat :</span>
                      <span className="patient-analyse-date-value">{formatDateShort(analyse.date_resultat)}</span>
                    </div>
                  )}
                </div>

                <div className={`patient-analyse-statut ${getStatutClass(analyse.statut)}`}>
                  {getStatutIcon(analyse.statut)}
                  {getStatutLabel(analyse.statut)}
                </div>
              </div>

              <div className="patient-analyse-actions">
                {analyse.statut !== 'EN_ATTENTE' && (
                  <>
                    <button 
                      className="patient-analyse-btn patient-analyse-btn-voir"
                      onClick={() => handleVoir(analyse)}
                    >
                      Voir les résultats
                    </button>
                    {analyse.fichier_pdf && (
                      <button 
                        className="patient-analyse-btn patient-analyse-btn-download"
                        onClick={() => handleTelecharger(analyse)}
                      >
                        Télécharger PDF
                      </button>
                    )}
                  </>
                )}
                {analyse.statut === 'EN_ATTENTE' && (
                  <div className="patient-analyse-waiting">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Résultats en cours d'analyse
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="patient-empty-analyses">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#D1D5DB" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" stroke="#D1D5DB" strokeWidth="2"/>
            </svg>
            <p>Aucune analyse trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAnalyses;