import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Calendar, User } from 'lucide-react';
import './Consultations.css';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const fetchConsultations = async () => {
      const medecinId = getMedecinId();
      if (!medecinId) {
        setError('ID médecin non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/medecins/${medecinId}/consultations`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setConsultations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredConsultations = consultations.filter(consultation => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientNom = consultation.patient?.nom?.toLowerCase() || '';
    const patientPrenom = consultation.patient?.prenom?.toLowerCase() || '';
    const diagnostic = consultation.compte_rendu?.toLowerCase() || '';
    return patientNom.includes(query) || patientPrenom.includes(query) || diagnostic.includes(query);
  });

  return (
    <div className="consultations">
      <div className="page-header">
        <div>
          <h1>Consultations</h1>
          <p className="subtitle">
            Rédigez et consultez les comptes-rendus médicaux
            {consultations.length > 0 && ` (${consultations.length} consultations)`}
          </p>
        </div>
        <button className="btn-new-consultation">
          <Plus size={20} />
          Nouvelle consultation
        </button>
      </div>

      <div className="consultations-container">
        <div className="search-filters">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une consultation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn">
            <Filter size={18} />
            Filtres
          </button>
        </div>

        <div className="consultations-content">
          {loading ? (
            <div className="loading-state"><p>Chargement...</p></div>
          ) : error ? (
            <div className="error-state"><p>Erreur: {error}</p></div>
          ) : filteredConsultations.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <p>Aucune consultation trouvée pour "{searchQuery}"</p>
              ) : (
                <>
                  <FileText size={48} color="#9CA3AF" />
                  <p>Aucune consultation enregistrée</p>
                  <button className="btn-empty-action">
                    <Plus size={18} />
                    Créer votre première consultation
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="consultations-list">
              {filteredConsultations.map((consultation) => (
                <div key={consultation.id_consultation} className="consultation-card">
                  <div className="consultation-header">
                    <div className="consultation-patient">
                      <User size={20} />
                      <div>
                        <h4>{consultation.patient?.prenom} {consultation.patient?.nom}</h4>
                        <span className="consultation-date">
                          <Calendar size={14} />
                          {formatDate(consultation.date_consultation)}
                        </span>
                      </div>
                    </div>
                    <span className="consultation-id">#{consultation.id_consultation}</span>
                  </div>

                  <div className="consultation-body">
                    {consultation.numero_dossier && (
                      <div className="consultation-field">
                        <span className="field-label">Dossier:</span>
                        <p className="field-value">{consultation.numero_dossier}</p>
                      </div>
                    )}

                    {consultation.compte_rendu && (
                      <div className="consultation-field">
                        <span className="field-label">Compte rendu:</span>
                        <p className="field-value">{consultation.compte_rendu}</p>
                      </div>
                    )}
                  </div>

                  <div className="consultation-footer">
                    <button className="btn-view-consultation">Voir détails</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consultations;