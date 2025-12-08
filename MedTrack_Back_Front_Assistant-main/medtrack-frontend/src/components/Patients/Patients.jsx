import React, { useState, useEffect } from 'react';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    telephone: '',
    email: '',
    adresse: '',
    genre: '',
    mot_de_passe: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      nom: patient.utilisateur?.nom || patient.nom || '',
      prenom: patient.utilisateur?.prenom || patient.prenom || '',
      date_naissance: patient.date_naissance || '',
      telephone: patient.telephone || '',
      email: patient.utilisateur?.email || patient.email || '',
      adresse: patient.adresse || '',
      genre: patient.genre || '',
      mot_de_passe: '' // Ne pas pré-remplir le mot de passe
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/patients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Patient supprimé avec succès');
        fetchPatients();
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
    try {
      const url = editingPatient 
        ? `http://localhost:3000/api/patients/${editingPatient.id_patient}`
        : 'http://localhost:3000/api/patients';
      
      const method = editingPatient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPatient(null);
        setFormData({
          nom: '',
          prenom: '',
          date_naissance: '',
          telephone: '',
          email: '',
          adresse: '',
          genre: '',
          mot_de_passe: ''
        });
        fetchPatients();
        alert(editingPatient ? 'Patient modifié avec succès' : 'Patient créé avec succès');
      } else {
        alert('Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'opération');
    }
  };

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1 className="page-title">Gestion des patients</h1>
        <button className="btn-add-patient" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Ajouter un patient
        </button>
      </div>

      {/* Table des patients */}
      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Téléphone</th>
              <th>Date de naissance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id_patient}>
                  <td className="td-bold">{patient.utilisateur?.nom || patient.nom || '-'}</td>
                  <td>{patient.utilisateur?.prenom || patient.prenom || '-'}</td>
                  <td>{patient.telephone}</td>
                  <td>{patient.date_naissance}</td>
                  <td>
                    <div className="actions-buttons">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(patient)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(patient.id_patient)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  Aucun patient enregistré
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajouter Patient */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPatient ? 'Modifier le patient' : 'Nouveau patient'}</h2>
              <button className="btn-close" onClick={() => {
                setShowModal(false);
                setEditingPatient(null);
                setFormData({
                  nom: '',
                  prenom: '',
                  date_naissance: '',
                  telephone: '',
                  email: '',
                  adresse: '',
                  genre: '',
                  mot_de_passe: ''
                });
              }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    value={formData.date_naissance}
                    onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  placeholder="123 Rue de la Santé, Paris"
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                />
              </div>

              <button type="submit" className="btn-submit">
                {editingPatient ? 'Modifier le patient' : 'Ajouter le patient'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
