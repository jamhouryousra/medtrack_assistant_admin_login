import React, { useState, useEffect } from 'react';
import './PatientProfile.css';

const PatientProfile = () => {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    genre: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Récupérer les données de l'utilisateur depuis localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(' Données utilisateur chargées:', userData);
    
    setUser(userData);

    // Charger les données complètes du patient depuis l'API
    try {
      // Récupérer tous les patients
      const patientsResponse = await fetch('http://localhost:3000/api/patients');
      
      if (!patientsResponse.ok) {
        throw new Error('Impossible de récupérer les patients');
      }
      
      const patients = await patientsResponse.json();
      const patientsData = Array.isArray(patients) ? patients : patients.data || [];
      
      // Trouver le patient qui correspond à cet utilisateur
      const currentPatient = patientsData.find(p => 
        p.id_patient === userData.id_patient || 
        p.id_user === userData.id_user
      );
      
      console.log(' Patient trouvé:', currentPatient);
      
      if (currentPatient) {
        setPatient(currentPatient);
        
        // Gérer les différents noms de champs (datenais OU date_naissance)
        const dateNaiss = currentPatient.datenais || currentPatient.date_naissance || '';
        const dateFormatted = dateNaiss ? dateNaiss.split('T')[0] : '';
        
        setFormData({
          nom: currentPatient.utilisateur?.nom || currentPatient.Utilisateur?.nom || userData.nom || '',
          prenom: currentPatient.utilisateur?.prenom || currentPatient.Utilisateur?.prenom || userData.prenom || '',
          email: currentPatient.utilisateur?.email || currentPatient.Utilisateur?.email || userData.email || '',
          telephone: currentPatient.telephone || '',
          adresse: currentPatient.adresse || '',
          dateNaissance: dateFormatted,
          genre: currentPatient.genre || ''
        });
      } else {
        console.warn(' Patient non trouvé dans la liste');
        // Si on ne trouve pas le patient dans la liste, utiliser les données du localStorage
        setFormData({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          telephone: userData.telephone || '',
          adresse: userData.adresse || '',
          dateNaissance: '',
          genre: ''
        });
      }
    } catch (error) {
      console.error(' Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données du localStorage
      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        email: userData.email || '',
        telephone: userData.telephone || '',
        adresse: userData.adresse || '',
        dateNaissance: '',
        genre: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Vérifier que l'utilisateur est bien connecté
    if (!user?.id_user && !user?.id_patient) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      return;
    }

    // Confirmation
    const confirmUpdate = window.confirm('Êtes-vous sûr de vouloir mettre à jour votre profil ?');
    if (!confirmUpdate) return;

    console.log(' Début de la sauvegarde...');
    console.log(' Données du formulaire:', formData);

    try {
      // Récupérer tous les patients
      const patientsResponse = await fetch('http://localhost:3000/api/patients');
      
      if (!patientsResponse.ok) {
        throw new Error('Impossible de récupérer les patients');
      }
      
      const patients = await patientsResponse.json();
      const patientsData = Array.isArray(patients) ? patients : patients.data || [];
      
      // Trouver le patient qui correspond à cet utilisateur
      const currentPatient = patientsData.find(p => 
        p.id_patient === user.id_patient || 
        p.id_user === user.id_user
      );
      
      console.log(' Patient actuel trouvé:', currentPatient);
      
      if (!currentPatient) {
        alert('Impossible de trouver votre profil patient. Veuillez contacter l\'administrateur.');
        return;
      }

      // Préparer les données à envoyer (avec les bons noms de champs selon les modèles)
      const updateData = {
        // Champs de la table Patient
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
        date_naissance: formData.dateNaissance || currentPatient.date_naissance,
        genre: formData.genre || currentPatient.genre,
        
        // Champs de la table Utilisateur
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      };

      console.log(' Données envoyées au backend:', updateData);

      // Appel API pour mettre à jour
      const response = await fetch(`http://localhost:3000/api/patients/${currentPatient.id_patient}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      console.log(' Réponse du serveur:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Erreur serveur:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'Erreur lors de la mise à jour');
        } catch {
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
      }

      // Succès!
      const result = await response.json();
      console.log(' Résultat:', result);
      
      // Mettre à jour le localStorage
      const updatedUser = {
        ...user,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert(' Profil mis à jour avec succès!');
      setIsEditing(false);
      
      // Recharger les données sans recharger toute la page
      await loadUserData();
      
    } catch (error) {
      console.error(' Erreur complète:', error);
      alert(' Erreur: ' + error.message);
    }
  };

  const getInitials = () => {
    const n = formData.nom?.charAt(0) || '';
    const p = formData.prenom?.charAt(0) || '';
    return (n + p).toUpperCase();
  };

  return (
    <div className="patient-profile-page">
      <h1 className="patient-profile-title">Mon profil</h1>

      <div className="patient-profile-card">
        <div className="patient-profile-header-section">
          <div className="patient-profile-avatar-large">
            {getInitials()}
          </div>
          <div className="patient-profile-header-info">
            <h2 className="patient-profile-name">
              {user?.prenom} {user?.nom}
            </h2>
            <p className="patient-profile-role">Patient</p>
          </div>
        </div>

        <div className="patient-profile-divider"></div>

        <div className="patient-profile-section">
          <h3 className="patient-profile-section-title">Informations personnelles</h3>

          <form onSubmit={handleSave} className="patient-profile-form" id="patient-profile-form">
            <div className="patient-profile-row">
              <div className="patient-profile-field">
                <label className="patient-profile-label">Nom complet</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="patient-profile-input"
                    placeholder="Nom"
                    required
                  />
                ) : (
                  <div className="patient-profile-value">{formData.nom || '-'}</div>
                )}
              </div>
              <div className="patient-profile-field">
                <label className="patient-profile-label">Prénom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="patient-profile-input"
                    placeholder="Prénom"
                    required
                  />
                ) : (
                  <div className="patient-profile-value">{formData.prenom || '-'}</div>
                )}
              </div>
            </div>

            <div className="patient-profile-row">
              <div className="patient-profile-field">
                <label className="patient-profile-label">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="patient-profile-input"
                    placeholder="email@example.com"
                    required
                  />
                ) : (
                  <div className="patient-profile-value">{formData.email || '-'}</div>
                )}
              </div>
              <div className="patient-profile-field">
                <label className="patient-profile-label">Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="patient-profile-input"
                    placeholder="+33 6 12 34 56 78"
                  />
                ) : (
                  <div className="patient-profile-value">{formData.telephone || '-'}</div>
                )}
              </div>
            </div>

            <div className="patient-profile-field">
              <label className="patient-profile-label">Date de naissance</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className="patient-profile-input"
                />
              ) : (
                <div className="patient-profile-value">
                  {formData.dateNaissance ? new Date(formData.dateNaissance).toLocaleDateString('fr-FR') : '-'}
                </div>
              )}
            </div>

            <div className="patient-profile-field">
              <label className="patient-profile-label">Adresse</label>
              {isEditing ? (
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="patient-profile-textarea"
                  placeholder="Adresse complète"
                  rows="3"
                />
              ) : (
                <div className="patient-profile-value">{formData.adresse || '-'}</div>
              )}
            </div>
          </form>

          <div className="patient-profile-actions">
            {!isEditing ? (
              <button 
                type="button"
                className="patient-profile-btn patient-profile-btn-edit"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(' Mode édition activé');
                  setIsEditing(true);
                }}
              >
                Modifier mes informations
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  className="patient-profile-btn patient-profile-btn-save"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(' Enregistrement...');
                    // Déclencher manuellement la soumission du formulaire
                    document.getElementById('patient-profile-form').dispatchEvent(
                      new Event('submit', { cancelable: true, bubbles: true })
                    );
                  }}
                >
                  Enregistrer
                </button>
                <button 
                  type="button"
                  className="patient-profile-btn patient-profile-btn-cancel"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(' Annulation');
                    setIsEditing(false);
                    loadUserData();
                  }}
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;