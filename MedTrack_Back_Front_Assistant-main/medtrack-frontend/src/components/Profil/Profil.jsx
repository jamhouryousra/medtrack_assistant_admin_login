import React, { useState, useEffect } from 'react';
import './Profil.css';

const Profil = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Récupérer les données de l'utilisateur depuis localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('📊 Données utilisateur chargées:', userData);
    
    setUser(userData);
    setFormData({
      nom: userData.nom || '',
      prenom: userData.prenom || '',
      email: userData.email || '',
      telephone: userData.telephone || '',
      mot_de_passe: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que l'utilisateur est bien connecté
    if (!user?.id_user) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      return;
    }

    // Afficher un loader
    const confirmUpdate = window.confirm('Êtes-vous sûr de vouloir mettre à jour votre profil ?');
    if (!confirmUpdate) return;

    try {
      // Récupérer tous les assistants
      const assistantsResponse = await fetch('http://localhost:3000/api/assistants');
      
      if (!assistantsResponse.ok) {
        throw new Error('Impossible de récupérer les assistants');
      }
      
      const assistants = await assistantsResponse.json();
      
      // Trouver l'assistant qui correspond à cet utilisateur
      const assistant = assistants.find(a => a.id_user === user.id_user);
      
      if (!assistant) {
        alert('Impossible de trouver votre profil assistant. Veuillez contacter l\'administrateur.');
        return;
      }

      // Préparer les données à envoyer (uniquement les champs modifiés)
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      };
      
      // Ajouter le téléphone si renseigné
      if (formData.telephone) {
        updateData.telephone = formData.telephone;
      }
      
      // Ajouter le mot de passe seulement s'il est rempli
      if (formData.mot_de_passe && formData.mot_de_passe.trim() !== '') {
        updateData.mot_de_passe = formData.mot_de_passe;
      }

      // Appel API pour mettre à jour
      const response = await fetch(`http://localhost:3000/api/assistants/${assistant.id_assistant}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      // Succès!
      const result = await response.json();
      
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
      
      alert('✅ Profil mis à jour avec succès!');
      setIsEditing(false);
      
      // Réinitialiser le mot de passe
      setFormData({...formData, mot_de_passe: ''});
      
      // Recharger la page après 1 seconde pour mettre à jour l'interface
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur complète:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="profil-page">
      <h1 className="page-title">Mon profil</h1>

      <div className="profil-card">
        {/* Avatar et Nom */}
        <div className="profil-header">
          <div className="profil-avatar">
            {getInitials(user?.prenom, user?.nom)}
          </div>
          <div className="profil-identity">
            <h2 className="profil-name">{user?.prenom} {user?.nom}</h2>
            <p className="profil-role">Assistant médical</p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="profil-form" id="profil-form">
          <div className="form-row-profile">
            <div className="form-group-profile">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group-profile">
              <label>Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {isEditing && (
            <>
              <div className="form-row-profile">
                <div className="form-group-profile">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group-profile">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group-profile">
                <label>Nouveau mot de passe (optionnel)</label>
                <input
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                  placeholder="Laisser vide pour ne pas changer"
                />
              </div>
            </>
          )}
        </form>

        {/* Boutons EN DEHORS du formulaire */}
        <div className="profil-actions">
          {!isEditing ? (
            <button 
              type="button" 
              className="btn-update"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 Mode édition activé');
                setIsEditing(true);
              }}
            >
              Mettre à jour
            </button>
          ) : (
            <>
              <button 
                type="button"
                className="btn-save"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('💾 Enregistrement...');
                  // Déclencher manuellement la soumission du formulaire
                  document.getElementById('profil-form').dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }}
              >
                Enregistrer
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('❌ Annulation');
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
  );
};

export default Profil;
