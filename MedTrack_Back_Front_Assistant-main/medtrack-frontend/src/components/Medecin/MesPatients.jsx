import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, Calendar } from 'lucide-react';
import './MesPatients.css';

const MesPatients = () => {
  const [patients, setPatients] = useState([]);
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
      console.error('Erreur parsing user:', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      const medecinId = getMedecinId();
      if (!medecinId) {
        setError('ID médecin non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/medecins/${medecinId}/dossiers`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nom = patient.utilisateur?.nom?.toLowerCase() || '';
    const prenom = patient.utilisateur?.prenom?.toLowerCase() || '';
    const email = patient.utilisateur?.email?.toLowerCase() || '';
    return nom.includes(query) || prenom.includes(query) || email.includes(query);
  });

  return (
    <div className="mes-patients">
      <div className="page-header">
        <div>
          <h1>Mes patients</h1>
          <p className="subtitle">Gérez votre patientèle ({patients.length} patients)</p>
        </div>
      </div>

      <div className="patients-container">
        <div className="search-filters">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn">
            <Filter size={18} />
            Filtres
          </button>
        </div>

        <div className="patients-content">
          {loading ? (
            <div className="loading-state"><p>Chargement...</p></div>
          ) : error ? (
            <div className="error-state"><p>Erreur: {error}</p></div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state"><p>Aucun patient trouvé</p></div>
          ) : (
            <div className="patients-grid">
              {filteredPatients.map((patient) => (
                <div key={patient.id_patient} className="patient-card">
                  <div className="patient-card-header">
                    <div className="patient-avatar">
                      {patient.utilisateur?.prenom?.charAt(0)}
                      {patient.utilisateur?.nom?.charAt(0)}
                    </div>
                    <div className="patient-main-info">
                      <h3>{patient.utilisateur?.prenom} {patient.utilisateur?.nom}</h3>
                      <p className="patient-age">{calculateAge(patient.date_naissance)} ans</p>
                      <span className="patient-numero">Dossier: {patient.numero_dossier}</span>
                    </div>
                  </div>

                  <div className="patient-card-body">
                    {patient.utilisateur?.email && (
                      <div className="patient-detail">
                        <Mail size={16} />
                        <span>{patient.utilisateur.email}</span>
                      </div>
                    )}
                    {patient.telephone && (
                      <div className="patient-detail">
                        <Phone size={16} />
                        <span>{patient.telephone}</span>
                      </div>
                    )}
                    {patient.date_naissance && (
                      <div className="patient-detail">
                        <Calendar size={16} />
                        <span>Né(e) le {formatDate(patient.date_naissance)}</span>
                      </div>
                    )}
                  </div>

                  <div className="patient-card-footer">
                    <button className="btn-view-patient">Voir le dossier</button>
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

export default MesPatients;