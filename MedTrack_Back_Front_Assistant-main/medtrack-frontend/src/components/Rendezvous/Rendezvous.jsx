import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import './Rendezvous.css';

const Rendezvous = () => {
  const [rendezvous, setRendezvous] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState(null);
  const { triggerNotificationRefresh } = useNotifications();
  const [formData, setFormData] = useState({
    id_patient: '',
    id_med: '',
    date_rdv: '',
    heure_debut: '',
    statut: 'PLANIFIE',
    note: ''
  });

  useEffect(() => {
    fetchRendezvous();
    fetchPatients();
    fetchMedecins();
  }, []);

  const fetchRendezvous = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rendezvous');
      const data = await response.json();
      const rdvArray = Array.isArray(data) ? data : data.data || [];
      
      // ✅ TRI PAR DATE DÉCROISSANTE (plus récents en premier)
      const rdvTries = rdvArray.sort((a, b) => {
        const dateComparison = new Date(b.date_rdv) - new Date(a.date_rdv);
        if (dateComparison !== 0) return dateComparison;
        
        const heureA = a.heure_debut || '00:00:00';
        const heureB = b.heure_debut || '00:00:00';
        return heureB.localeCompare(heureA);
      });
      
      setRendezvous(rdvTries);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMedecins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medecins');
      const data = await response.json();
      setMedecins(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getPatientById = (id) => {
    return patients.find(p => p.id_patient === id);
  };

  const getMedecinById = (id) => {
    return medecins.find(m => m.id_med === id);
  };

  // Vérifier si un RDV est passé (automatiquement terminé)
  const isRdvPasse = (dateRdv, heureDebut) => {
    const now = new Date();
    const rdvDateTime = new Date(`${dateRdv}T${heureDebut}`);
    return now > rdvDateTime;
  };

  // ✅ Fonction pour calculer heure_fin = heure_debut + 30 minutes
  const calculateEndTime = (startTime) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 30; // Ajouter 30 minutes
    
    const endHours = Math.floor(totalMinutes / 60) % 24; // Modulo 24 pour gérer minuit
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleEdit = (rdv) => {
    setEditingRdv(rdv);
    setFormData({
      id_patient: rdv.id_patient || '',
      id_med: rdv.id_med || '',
      date_rdv: rdv.date_rdv || '',
      heure_debut: rdv.heure_debut?.substring(0, 5) || '',
      statut: rdv.statut || 'PLANIFIE',
      note: rdv.note || ''
    });
    setShowModal(true);
  };

  // ✅ NOUVEAU : Annuler un RDV directement
  const handleAnnuler = async (rdvId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const rdvActuel = rendezvous.find(r => r.id_rdv === rdvId);
      if (!rdvActuel) {
        alert('Rendez-vous introuvable');
        return;
      }

      const rdvData = {
        date_rdv: rdvActuel.date_rdv,
        heure_debut: rdvActuel.heure_debut,
        heure_fin: rdvActuel.heure_fin,
        statut: 'ANNULE',
        note: rdvActuel.note || ''
      };

      console.log('📤 Annulation RDV:', rdvData);

      const response = await fetch(`http://localhost:3000/api/rendezvous/${rdvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rdvData)
      });

      if (response.ok) {
        alert('Rendez-vous annulé avec succès');
        await fetchRendezvous();
        triggerNotificationRefresh();
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.message || 'Impossible d\'annuler le rendez-vous'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/rendezvous/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Rendez-vous supprimé avec succès');
        await fetchRendezvous();
        triggerNotificationRefresh();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const id_assistant = user.id_assistant || 1;

    // ✅ CALCULER automatiquement heure_fin (+ 30 minutes)
    const calculatedHeureFin = calculateEndTime(formData.heure_debut);

    const rdvData = {
      id_patient: parseInt(formData.id_patient),
      id_med: parseInt(formData.id_med),
      id_assistant: id_assistant,
      date_rdv: formData.date_rdv,
      heure_debut: formData.heure_debut + ':00',
      heure_fin: calculatedHeureFin + ':00', // ← Calculé automatiquement
      statut: formData.statut || 'PLANIFIE',
      note: formData.note || ''
    };

    console.log('📤 Envoi des données:', rdvData);

    try {
      const url = editingRdv 
        ? `http://localhost:3000/api/rendezvous/${editingRdv.id_rdv}`
        : 'http://localhost:3000/api/rendezvous';
      
      const method = editingRdv ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rdvData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingRdv(null);
        setFormData({
          id_patient: '',
          id_med: '',
          date_rdv: '',
          heure_debut: '',
          statut: 'PLANIFIE',
          note: ''
        });
        await fetchRendezvous();
        triggerNotificationRefresh();
        alert(editingRdv ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.message || 'Erreur lors de l\'opération'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'opération');
    }
  };

  const getStatutBadge = (statut, dateRdv, heureDebut) => {
    let statutFinal = statut;
    if (statut?.toUpperCase() === 'PLANIFIE' && dateRdv && heureDebut) {
      if (isRdvPasse(dateRdv, heureDebut)) {
        statutFinal = 'TERMINE';
      }
    }
    
    const styles = {
      'PLANIFIE': { bg: '#D1FAE5', color: '#065F46', text: 'confirmé' },
      'CONFIRME': { bg: '#D1FAE5', color: '#065F46', text: 'confirmé' },
      'TERMINE': { bg: '#DBEAFE', color: '#1E40AF', text: 'terminé' },
      'EN_ATTENTE': { bg: '#FEF3C7', color: '#92400E', text: 'en attente' },
      'ANNULE': { bg: '#FEE2E2', color: '#991B1B', text: 'annulé' }
    };
    
    const statutUpper = statutFinal?.toUpperCase();
    const style = styles[statutUpper] || { bg: '#F3F4F6', color: '#6B7280', text: statutUpper || 'inconnu' };
    
    return (
      <span 
        className="statut-badge"
        style={{ background: style.bg, color: style.color }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <div className="rendezvous-page">
      <div className="rendezvous-header">
        <h1 className="page-title">Rendez-vous</h1>
        <button className="btn-add-rdv" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Planifier un rendez-vous
        </button>
      </div>

      {/* Table des rendez-vous */}
      <div className="rendezvous-table-container">
        <table className="rendezvous-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rendezvous.map((rdv) => {
              const patient = getPatientById(rdv.id_patient);
              const medecin = getMedecinById(rdv.id_med);
              
              return (
                <tr key={rdv.id_rdv}>
                  <td className="td-bold">
                    {patient?.utilisateur?.nom || ''} {patient?.utilisateur?.prenom || ''}
                  </td>
                  <td>
                    Dr. {medecin?.utilisateur?.nom || ''} {medecin?.utilisateur?.prenom || ''}
                  </td>
                  <td>{rdv.date_rdv}</td>
                  <td>{rdv.heure_debut?.substring(0, 5)}</td>
                  <td>{getStatutBadge(rdv.statut, rdv.date_rdv, rdv.heure_debut)}</td>
                  <td>
                    <div className="actions-buttons">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(rdv)}
                      >
                        Modifier
                      </button>
                      {rdv.statut?.toUpperCase() !== 'ANNULE' && (
                        <button 
                          className="btn-action btn-annuler"
                          onClick={() => handleAnnuler(rdv.id_rdv)}
                          style={{ background: '#FEF3C7', color: '#92400E' }}
                        >
                          Annuler
                        </button>
                      )}
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(rdv.id_rdv)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Planifier/Modifier Rendez-vous */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setEditingRdv(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h2>
              <button className="btn-close" onClick={() => {
                setShowModal(false);
                setEditingRdv(null);
              }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rdv-form">
              <div className="form-group">
                <label>Patient *</label>
                <select
                  value={formData.id_patient}
                  onChange={(e) => setFormData({...formData, id_patient: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id_patient} value={p.id_patient}>
                      {p.utilisateur?.nom} {p.utilisateur?.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Médecin *</label>
                <select
                  value={formData.id_med}
                  onChange={(e) => setFormData({...formData, id_med: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map(m => (
                    <option key={m.id_med} value={m.id_med}>
                      Dr. {m.utilisateur?.nom} {m.utilisateur?.prenom} ({m.specialite})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date_rdv}
                    onChange={(e) => setFormData({...formData, date_rdv: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Heure début *</label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData({...formData, heure_debut: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* ✅ NOUVEAU : Afficher heure_fin calculée automatiquement */}
              {formData.heure_debut && (
                <div className="form-group">
                  <label>Heure fin (calculée automatiquement)</label>
                  <input
                    type="text"
                    value={`${calculateEndTime(formData.heure_debut)} (30 minutes de consultation)`}
                    readOnly
                    style={{ 
                      backgroundColor: '#F3F4F6', 
                      cursor: 'not-allowed',
                      color: '#6B7280'
                    }}
                  />
                  <small style={{ 
                    color: '#6B7280', 
                    fontSize: '13px', 
                    marginTop: '4px', 
                    display: 'block' 
                  }}>
                    💡 La durée de consultation est fixée à 30 minutes
                  </small>
                </div>
              )}

              {/* Dropdown Statut (seulement en mode édition) */}
              {editingRdv && (
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    required
                    className="statut-select"
                  >
                    <option value="PLANIFIE">Planifié (Confirmé)</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                  <small className="form-hint">
                    {formData.statut === 'PLANIFIE' && '✅ Le rendez-vous est confirmé'}
                    {formData.statut === 'TERMINE' && '🏁 Le patient a été consulté'}
                    {formData.statut === 'ANNULE' && '❌ Le rendez-vous a été annulé'}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Note (optionnel)</label>
                <textarea
                  placeholder="Ajouter une note..."
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-submit">
                {editingRdv ? 'Modifier' : 'Planifier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rendezvous;