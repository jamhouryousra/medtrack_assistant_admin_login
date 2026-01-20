import { useState, useEffect } from 'react';

export default function GestionAssistant() {
  const [assistants, setAssistants] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: ''
  });

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/assistants');
      const data = await res.json();
      setAssistants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = () => {
    setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (assistant) => {
    setFormData({
      nom: assistant.utilisateur?.nom || '',
      prenom: assistant.utilisateur?.prenom || '',
      email: assistant.utilisateur?.email || '',
      mot_de_passe: ''
    });
    setEditingId(assistant.id_assistant);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      };

      if (formData.mot_de_passe && formData.mot_de_passe.trim() !== '') {
        payload.mot_de_passe = formData.mot_de_passe;
      }

      const url = editingId
        ? `http://localhost:3000/api/assistants/${editingId}`
        : 'http://localhost:3000/api/assistants';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');

      setMessage(editingId ? 'Assistant modifié avec succès !' : 'Assistant créé avec succès !');
      handleCloseModal();
      fetchAssistants();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/assistants/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur suppression');
      }

      setMessage('Assistant supprimé.');
      fetchAssistants();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteId(null);
  };

  return (
    <div className="admin-gestion-page">
      {/* Header */}
      <div className="admin-gestion-header">
        <h1 className="admin-page-title">Gestion des Assistants</h1>
        <button className="admin-btn-add" onClick={handleOpenModal}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Ajouter un assistant
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={message.includes('Erreur') ? 'admin-alert-error' : 'admin-alert-success'}>
          {message}
        </div>
      )}

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assistants.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-empty-state">
                  Aucun assistant enregistré
                </td>
              </tr>
            ) : (
              assistants.map((assistant) => (
                <tr key={assistant.id_assistant}>
                  <td className="admin-table-name">
                    {assistant.utilisateur?.nom} {assistant.utilisateur?.prenom}
                  </td>
                  <td className="admin-table-email">{assistant.utilisateur?.email}</td>
                  <td>
                    <span className="admin-badge admin-badge-assistant">
                      Assistant
                    </span>
                  </td>
                  <td className="admin-table-actions">
                    <button className="admin-action-btn admin-action-edit" onClick={() => handleEdit(assistant)}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M12.5 2.5l3 3L6 15H3v-3L12.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="admin-action-btn admin-action-delete" onClick={() => handleDeleteClick(assistant.id_assistant)}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 5h12M7 8v5M11 8v5M4 5l1 10h8l1-10M7 5V3h4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Add/Edit */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingId ? "Modifier l'assistant" : 'Ajouter un assistant'}
              </h2>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="admin-form-input"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="admin-form-input"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mot de passe</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="admin-form-input"
                  placeholder={editingId ? 'Laisser vide pour ne pas changer' : ''}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn-submit">
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {showConfirmDialog && (
        <div className="admin-confirm-overlay">
          <div className="admin-confirm-dialog">
            <div className="admin-confirm-header">
              <h3 className="admin-confirm-title">localhost:5173 indique</h3>
            </div>
            <div className="admin-confirm-body">
              <p className="admin-confirm-message">Voulez-vous vraiment annuler ce rendez-vous ?</p>
            </div>
            <div className="admin-confirm-actions">
              <button className="admin-confirm-btn admin-confirm-ok" onClick={handleConfirmDelete}>
                OK
              </button>
              <button className="admin-confirm-btn admin-confirm-cancel" onClick={handleCancelDelete}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}