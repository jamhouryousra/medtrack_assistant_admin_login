import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Edit2, Save } from 'lucide-react';
import './ProfilMedecin.css';

const ProfilMedecin = () => {
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    specialite: ''
  });

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
    const fetchProfile = async () => {
      const medecinId = getMedecinId();
      
      if (!medecinId) {
        setError('ID médecin non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3000/api/medecins/${medecinId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Profil médecin:', data);
        setMedecin(data);
        setFormData({
          specialite: data.specialite || ''
        });
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const medecinId = getMedecinId();
    
    try {
      const response = await fetch(`http://localhost:3000/api/medecins/${medecinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialite: formData.specialite
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const updatedData = await response.json();
      console.log('✅ Updated profile:', updatedData);
      
      // Service now returns full profile with utilisateur and stats
      setMedecin(updatedData);
      setIsEditing(false);
      
      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          specialite: formData.specialite
        }));
      }
      
      alert('✅ Profil mis à jour avec succès!');
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de la sauvegarde du profil: ' + error.message);
    }
  };

  const getInitials = () => {
    if (medecin?.utilisateur?.prenom && medecin?.utilisateur?.nom) {
      return `${medecin.utilisateur.prenom.charAt(0)}${medecin.utilisateur.nom.charAt(0)}`.toUpperCase();
    }
    return 'DM';
  };

  if (loading) {
    return (
      <div className="profil-medecin">
        <div className="loading-state">
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profil-medecin">
        <div className="error-state">
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-medecin">
      <div className="page-header">
        <h1>Mon profil</h1>
        <p className="subtitle">Gérez vos informations personnelles et préférences</p>
        <button 
          className={`btn-edit ${isEditing ? 'editing' : ''}`}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <Save size={18} />
              Enregistrer
            </>
          ) : (
            <>
              <Edit2 size={18} />
              Modifier
            </>
          )}
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials()}
            </div>
            <div className="profile-info">
              <h3>
                Dr. {medecin?.utilisateur?.prenom} {medecin?.utilisateur?.nom}
              </h3>
              <p className="specialite">{medecin?.specialite || 'Médecine Générale'}</p>
              <p className="email">
                <Mail size={16} />
                {medecin?.utilisateur?.email}
              </p>
            </div>
          </div>

          <div className="profile-section">
            <h4>Informations professionnelles</h4>
            <div className="info-grid">
              <div className="info-field">
                <label>ID Médecin</label>
                <input
                  type="text"
                  value={medecin?.id_med || ''}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="info-field">
                <label>Spécialité</label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={isEditing ? 'editable-input' : 'readonly-input'}
                />
              </div>

              <div className="info-field">
                <label>Email professionnel</label>
                <input
                  type="email"
                  value={medecin?.utilisateur?.email || ''}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="info-field">
                <label>Rôle</label>
                <input
                  type="text"
                  value={medecin?.utilisateur?.role || ''}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilMedecin;