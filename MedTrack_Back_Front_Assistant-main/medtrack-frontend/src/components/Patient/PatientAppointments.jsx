import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import './PatientAppointments.css';

const PatientAppointments = () => {
  const [rendezvous, setRendezvous] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreSpecialite, setFiltreSpecialite] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState(null);
  const [realPatientId, setRealPatientId] = useState(null);
  const { triggerNotificationRefresh } = useNotifications(); // ← AJOUTÉ
  const [formData, setFormData] = useState({
    id_med: '',
    date_rdv: '',
    heure_debut: '',
    notes: ''
  });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const patientId = realPatientId || user?.id_patient; // ← Utiliser realPatientId en priorité

  console.log(' User from localStorage:', user);
  console.log(' Patient ID from localStorage:', user?.id_patient);
  console.log(' Real Patient ID (from API):', realPatientId);
  console.log(' Patient ID utilisé:', patientId);

  //  Récupérer l'id_patient depuis l'API si absent du localStorage
  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user?.id_user) return;
      
      // Si on a déjà id_patient dans localStorage, pas besoin de fetch
      if (user.id_patient) {
        setRealPatientId(user.id_patient);
        return;
      }

      try {
        console.log(' Recherche du patient avec id_user:', user.id_user);
        const response = await fetch('http://localhost:3000/api/patients');
        const patients = await response.json();
        const patientsData = Array.isArray(patients) ? patients : patients.data || [];
        
        const currentPatient = patientsData.find(p => p.id_user === user.id_user);
        
        if (currentPatient) {
          console.log(' Patient trouvé:', currentPatient);
          setRealPatientId(currentPatient.id_patient);
          
          // Mettre à jour le localStorage pour les prochaines fois
          const updatedUser = { ...user, id_patient: currentPatient.id_patient };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          console.error(' Aucun patient trouvé avec id_user:', user.id_user);
        }
      } catch (error) {
        console.error(' Erreur lors de la récupération du patient:', error);
      }
    };

    fetchPatientId();
  }, [user?.id_user]);

  useEffect(() => {
    // Charger les médecins au montage du composant (indépendant du patient)
    fetchMedecins();
  }, []);

  useEffect(() => {
    // Charger les rendez-vous seulement quand on a le patientId
    if (patientId) {
      fetchRendezvous();
    }
  }, [patientId]);

  const fetchMedecins = async () => {
    try {
      console.log('Fetching médecins...');
      const response = await fetch('http://localhost:3000/api/medecins');
      const data = await response.json();
      console.log(' Médecins reçus:', data);
      console.log(' Nombre de médecins:', data.length);
      if (data.length > 0) {
        console.log(' Premier médecin:', data[0]);
      }
      setMedecins(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(' Erreur médecins:', error);
    }
  };

  const getMedecinById = (id) => {
    return medecins.find(m => m.id_med === id);
  };

  //  Obtenir toutes les spécialités uniques
  const getSpecialitesUniques = () => {
    const specialites = medecins
      .map(m => m.specialite)
      .filter(s => s) // Supprimer les null/undefined
      .filter((value, index, self) => self.indexOf(value) === index); // Unique
    return specialites.sort(); // Trier alphabétiquement
  };

  //  Filtrer les médecins par spécialité sélectionnée
  const medecinsFiltres = filtreSpecialite === 'tous' 
    ? medecins 
    : medecins.filter(m => m.specialite === filtreSpecialite);

  const fetchRendezvous = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rendezvous');
      const data = await response.json();
      const allRdv = Array.isArray(data) ? data : data.data || [];

      // Filtrer les RDV du patient
      const mesRdv = allRdv.filter(r => r.id_patient === patientId);

      // Trier par date décroissante (plus récents en premier)
      const rdvTries = mesRdv.sort((a, b) => 
        new Date(b.date_rdv) - new Date(a.date_rdv)
      );

      setRendezvous(rdvTries);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAnnuler = async (rdvId) => {
    if (!window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      return;
    }

    try {
      console.log(' Annulation du RDV:', rdvId);
      
      // Récupérer le RDV actuel pour avoir toutes les données
      const rdvActuel = rendezvous.find(r => r.id_rdv === rdvId);
      
      if (!rdvActuel) {
        alert('Rendez-vous introuvable');
        return;
      }

      // Envoyer toutes les données avec statut = ANNULE
      const rdvData = {
        date_rdv: rdvActuel.date_rdv,
        heure_debut: rdvActuel.heure_debut,
        heure_fin: rdvActuel.heure_fin,
        statut: 'ANNULE', // ← Changer le statut
        note: rdvActuel.note || ''
      };

      console.log(' Données envoyées:', rdvData);

      const response = await fetch(`http://localhost:3000/api/rendezvous/${rdvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rdvData)
      });

      console.log(' Response status:', response.status);
      console.log(' Response OK:', response.ok);

      if (response.ok) {
        console.log('RDV annulé avec succès');
        alert('Rendez-vous annulé avec succès');
        // Recharger la liste immédiatement
        await fetchRendezvous();
        triggerNotificationRefresh(); // ← AJOUTÉ : Rafraîchir les notifications
      } else {
        const errorText = await response.text();
        console.error(' Erreur serveur:', errorText);
        
        let errorMessage = 'Impossible d\'annuler le rendez-vous';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
          console.error('Détails:', errorJson);
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert('Erreur: ' + errorMessage);
      }
    } catch (error) {
      console.error(' Erreur complète:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const handleOpenModal = () => {
    setEditingRdv(null);
    setFiltreSpecialite('tous'); // ← Réinitialiser le filtre
    setFormData({
      id_med: '',
      date_rdv: '',
      heure_debut: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRdv(null);
    setFiltreSpecialite('tous'); // ← Réinitialiser le filtre
  };

  const handleModifier = (rdv) => {
    console.log('Modification du RDV:', rdv);
    setEditingRdv(rdv);
    setFiltreSpecialite('tous'); // ← Réinitialiser le filtre
    setFormData({
      id_med: rdv.id_med || '',
      date_rdv: rdv.date_rdv || '',
      heure_debut: rdv.heure_debut?.substring(0, 5) || '',
      notes: rdv.note || rdv.notes || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour calculer heure_fin = heure_debut + 30 minutes
  const calculateEndTime = (startTime) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 30; // Ajouter 30 minutes
    
    const endHours = Math.floor(totalMinutes / 60) % 24; // Modulo 24 pour gérer minuit
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId) {
      alert('Erreur: Patient non identifié');
      return;
    }

    if (!formData.id_med || !formData.date_rdv || !formData.heure_debut) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      let rdvData;
      
      if (editingRdv) {
        // MODE ÉDITION : Calculer heure_fin automatiquement
        const calculatedHeureFin = calculateEndTime(formData.heure_debut);
        
        rdvData = {
          date_rdv: formData.date_rdv,
          heure_debut: formData.heure_debut + ':00',
          heure_fin: calculatedHeureFin + ':00', // ← Calculé automatiquement
          note: formData.notes || ''
        };
      } else {
        //  MODE CRÉATION : Calculer heure_fin automatiquement
        const id_assistant = user?.id_assistant || 1;
        const calculatedHeureFin = calculateEndTime(formData.heure_debut);
        
        rdvData = {
          id_patient: patientId,
          id_med: parseInt(formData.id_med),
          id_assistant: id_assistant,
          date_rdv: formData.date_rdv,
          heure_debut: formData.heure_debut + ':00',
          heure_fin: calculatedHeureFin + ':00', // Calculé automatiquement
          statut: 'PLANIFIE',
          note: formData.notes || ''
        };
      }

      console.log(editingRdv ? ' Modification RDV:' : ' Création RDV:', rdvData);
      console.log(' Patient ID utilisé:', patientId);

      const url = editingRdv
        ? `http://localhost:3000/api/rendezvous/${editingRdv.id_rdv}`
        : 'http://localhost:3000/api/rendezvous';
      
      const method = editingRdv ? 'PUT' : 'POST';

      console.log(' URL:', url);
      console.log(' Method:', method);

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rdvData)
      });

      console.log(' Response status:', response.status);
      console.log(' Response OK:', response.ok);

      if (response.ok) {
        alert(editingRdv ? ' Rendez-vous modifié avec succès!' : ' Rendez-vous créé avec succès!');
        handleCloseModal();
        await fetchRendezvous();
        triggerNotificationRefresh(); // ← AJOUTÉ : Rafraîchir les notifications
      } else {
        const errorText = await response.text();
        console.error(' Erreur serveur (texte brut):', errorText);
        console.error(' Status:', response.status);
        
        let errorMessage = 'Impossible de sauvegarder le rendez-vous';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
          console.error('Détails JSON:', errorJson);
        } catch {
          console.error(' Erreur non-JSON');
          errorMessage = errorText || errorMessage;
        }
        
        alert(' Erreur: ' + errorMessage);
      }
    } catch (error) {
      console.error(' Erreur complète:', error);
      alert(' Erreur lors de la sauvegarde du rendez-vous');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '00:00';
    return timeStr.substring(0, 5);
  };

  //  Fonction pour vérifier si un RDV est passé
  const isRdvPasse = (dateRdv, heureDebut) => {
    if (!dateRdv || !heureDebut) return false;
    
    const now = new Date();
    const rdvDateTime = new Date(`${dateRdv}T${heureDebut}`);
    
    return now > rdvDateTime;
  };

  //  Fonction pour obtenir le statut réel (auto-terminer si passé)
  const getStatutReel = (rdv) => {
    const statutActuel = rdv.statut?.toUpperCase() || 'PLANIFIE';
    
    // Si le RDV est PLANIFIE ou CONFIRME mais la date est passée → TERMINE
    if ((statutActuel === 'PLANIFIE' || statutActuel === 'CONFIRME') && 
        isRdvPasse(rdv.date_rdv, rdv.heure_debut)) {
      return 'TERMINE';
    }
    
    return statutActuel;
  };

  const getStatutClass = (statut, dateRdv, heureDebut) => {
    //  Vérifier si le RDV est passé
    if (dateRdv && heureDebut) {
      const now = new Date();
      const rdvDateTime = new Date(`${dateRdv}T${heureDebut}`);
      
      // Si le RDV est passé et qu'il n'est pas annulé, il est automatiquement terminé
      if (rdvDateTime < now && statut?.toLowerCase() !== 'annule') {
        return 'patient-status-completed';
      }
    }
    
    const s = statut?.toLowerCase();
    if (s === 'confirmé' || s === 'planifie') return 'patient-status-confirmed';
    if (s === 'termine') return 'patient-status-completed';
    if (s === 'annule') return 'patient-status-cancelled';
    return 'patient-status-pending';
  };

  const getStatutLabel = (statut, dateRdv, heureDebut) => {
    //  Vérifier si le RDV est passé
    if (dateRdv && heureDebut) {
      const now = new Date();
      const rdvDateTime = new Date(`${dateRdv}T${heureDebut}`);
      
      // Si le RDV est passé et qu'il n'est pas annulé, il est automatiquement terminé
      if (rdvDateTime < now && statut?.toLowerCase() !== 'annule') {
        return 'Terminé';
      }
    }
    
    const s = statut?.toLowerCase();
    if (s === 'confirmé' || s === 'planifie') return 'Confirmé';
    if (s === 'termine') return 'Terminé';
    if (s === 'annule') return 'Annulé';
    return 'En attente';
  };

  const getStatutIcon = (statut, dateRdv, heureDebut) => {
    //  Vérifier si le RDV est passé
    if (dateRdv && heureDebut) {
      const now = new Date();
      const rdvDateTime = new Date(`${dateRdv}T${heureDebut}`);
      
      // Si le RDV est passé et qu'il n'est pas annulé, afficher l'icône "terminé"
      if (rdvDateTime < now && statut?.toLowerCase() !== 'annule') {
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#3B82F6" fillOpacity="0.1"/>
            <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      }
    }
    
    const s = statut?.toLowerCase();
    if (s === 'confirmé' || s === 'planifie') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.1"/>
          <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (s === 'termine') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" fillOpacity="0.1"/>
          <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (s === 'annule') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#EF4444" fillOpacity="0.1"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  };

  const rdvFiltres = rendezvous.filter(rdv => {
    if (filtreStatut === 'tous') return true;
    
    const s = rdv.statut?.toLowerCase();
    const now = new Date();
    const rdvDateTime = new Date(`${rdv.date_rdv}T${rdv.heure_debut}`);
    const isPasse = rdvDateTime < now;
    
    //  Les RDV passés sont considérés comme "terminés" même si statut = PLANIFIE
    if (filtreStatut === 'termine') {
      return s === 'termine' || (isPasse && s !== 'annule');
    }
    
    //  Les RDV confirmés ne montrent que les futurs
    if (filtreStatut === 'confirme') {
      return (s === 'confirmé' || s === 'planifie') && !isPasse;
    }
    
    if (filtreStatut === 'annule') return s === 'annule';
    return false;
  });

  return (
    <div className="patient-appointments-page">
      <div className="patient-appointments-header">
        <h1 className="patient-appointments-title">Mes rendez-vous</h1>
        <button className="patient-btn-new-rdv" onClick={handleOpenModal}>
          + Nouveau rendez-vous
        </button>
      </div>

      {/* Filtres */}
      <div className="patient-rdv-filters">
        <span className="patient-filter-label">Filtrer par statut :</span>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'tous' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('tous')}
        >
          Tous
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'confirme' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('confirme')}
        >
          Confirmés
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'termine' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('termine')}
        >
          Terminés
        </button>
        <button 
          className={`patient-filter-btn ${filtreStatut === 'annule' ? 'active' : ''}`}
          onClick={() => setFiltreStatut('annule')}
        >
          Annulés
        </button>
      </div>

      {/* Liste des rendez-vous */}
      <div className="patient-rdv-container">
        {rdvFiltres.length > 0 ? (
          rdvFiltres.map((rdv) => {
            const medecin = getMedecinById(rdv.id_med);
            const medecinNom = medecin?.utilisateur?.nom || 'Médecin';
            const medecinPrenom = medecin?.utilisateur?.prenom || '';
            const specialite = medecin?.specialite || 'Consultation';

            return (
              <div key={rdv.id_rdv} className="patient-rdv-item">
                <div className="patient-rdv-item-icon">
                  {getStatutIcon(rdv.statut, rdv.date_rdv, rdv.heure_debut)}
                </div>
                <div className="patient-rdv-item-info">
                  <div className="patient-rdv-item-doctor">
                    Dr. {medecinNom} {medecinPrenom}
                  </div>
                  <div className="patient-rdv-item-type">{specialite}</div>
                </div>
                <div className="patient-rdv-item-datetime">
                  <div className="patient-rdv-item-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="15" rx="2" stroke="#6B7280" strokeWidth="2"/>
                      <path d="M3 10h18M8 3v4M16 3v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {formatDate(rdv.date_rdv)}
                  </div>
                  <div className="patient-rdv-item-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {formatTime(rdv.heure_debut || rdv.heure_rdv)}
                  </div>
                </div>
                <div className={`patient-rdv-item-status ${getStatutClass(rdv.statut, rdv.date_rdv, rdv.heure_debut)}`}>
                  {getStatutLabel(rdv.statut, rdv.date_rdv, rdv.heure_debut)}
                </div>
                <div className="patient-rdv-item-actions">
                  {/* Afficher boutons seulement si RDV futur et confirmé/planifié */}
                  {(() => {
                    const now = new Date();
                    const rdvDateTime = new Date(`${rdv.date_rdv}T${rdv.heure_debut}`);
                    const isFuture = rdvDateTime >= now;
                    const isConfirmed = rdv.statut?.toLowerCase() === 'confirmé' || rdv.statut?.toLowerCase() === 'planifie';
                    
                    return isFuture && isConfirmed ? (
                      <>
                        <button 
                          className="patient-action-btn patient-action-modify"
                          onClick={() => handleModifier(rdv)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="patient-action-btn patient-action-cancel"
                          onClick={() => handleAnnuler(rdv.id_rdv)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="patient-empty-rdv">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="#D1D5DB" strokeWidth="2"/>
              <path d="M3 10h18M8 3v4M16 3v4" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>Aucun rendez-vous trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Nouveau Rendez-vous */}
      {showModal && (
        <div className="patient-modal-overlay" onClick={handleCloseModal}>
          <div className="patient-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="patient-modal-header">
              <h2 className="patient-modal-title">
                {editingRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <button className="patient-modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="patient-modal-form">
              {/*  FILTRE PAR SPÉCIALITÉ */}
              <div className="patient-form-group">
                <label className="patient-form-label">
                  Filtrer par spécialité
                </label>
                <select
                  value={filtreSpecialite}
                  onChange={(e) => setFiltreSpecialite(e.target.value)}
                  className="patient-form-select patient-filter-select"
                >
                  <option value="tous">Toutes les spécialités</option>
                  {getSpecialitesUniques().map(specialite => (
                    <option key={specialite} value={specialite}>
                      {specialite}
                    </option>
                  ))}
                </select>
              </div>

              <div className="patient-form-group">
                <label className="patient-form-label">
                  Médecin <span className="patient-required">*</span>
                </label>
                <select
                  name="id_med"
                  value={formData.id_med}
                  onChange={handleFormChange}
                  className="patient-form-select"
                  required
                  onClick={() => console.log('🔍 Médecins dans le state:', medecins)}
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecinsFiltres.map(medecin => {
                    console.log('🔍 Mapping médecin:', medecin);
                    return (
                      <option key={medecin.id_med} value={medecin.id_med}>
                        Dr. {medecin.utilisateur?.nom} {medecin.utilisateur?.prenom} 
                        {medecin.specialite && ` - ${medecin.specialite}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="patient-form-row">
                <div className="patient-form-group">
                  <label className="patient-form-label">
                    Date <span className="patient-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_rdv"
                    value={formData.date_rdv}
                    onChange={handleFormChange}
                    className="patient-form-input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="patient-form-group">
                  <label className="patient-form-label">
                    Heure de début <span className="patient-required">*</span>
                  </label>
                  <input
                    type="time"
                    name="heure_debut"
                    value={formData.heure_debut}
                    onChange={handleFormChange}
                    className="patient-form-input"
                    required
                  />
                </div>
              </div>

              {/* Heure de fin calculée automatiquement */}
              {formData.heure_debut && (
                <div className="patient-form-group">
                  <label className="patient-form-label">
                    Heure de fin (calculée automatiquement)
                  </label>
                  <input
                    type="text"
                    value={`${calculateEndTime(formData.heure_debut)} (30 minutes de consultation)`}
                    className="patient-form-input"
                    readOnly
                    style={{ backgroundColor: '#F3F4F6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                    💡 La durée de consultation est fixée à 30 minutes
                  </small>
                </div>
              )}

              <div className="patient-form-group">
                <label className="patient-form-label">Notes (optionnel)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="patient-form-textarea"
                  placeholder="Raison de la consultation, symptômes..."
                  rows="3"
                />
              </div>

              <div className="patient-modal-actions">
                <button
                  type="button"
                  className="patient-btn-cancel-modal"
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
                <button type="submit" className="patient-btn-submit-modal">
                  {editingRdv ? 'Modifier le rendez-vous' : 'Créer le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;