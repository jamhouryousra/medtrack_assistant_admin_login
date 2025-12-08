// src/components/Admin/Admin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  // Forms
  const [medForm, setMedForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    specialite: "",
  });
  const [assistantForm, setAssistantForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
  });

  // Lists & messages
  const [medecins, setMedecins] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [message, setMessage] = useState("");

  // Editing ids
  const [editingMedId, setEditingMedId] = useState(null);
  const [editingAssistantId, setEditingAssistantId] = useState(null);

  useEffect(() => {
    fetchMedecins();
    fetchAssistants();
  }, []);

  // ✅ FONCTION DE DÉCONNEXION
  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      // Nettoyer le localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers le login
      navigate('/login');
    }
  };

  // Fetchers
  const fetchMedecins = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/medecins");
      const data = await res.json();
      setMedecins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssistants = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/assistants");
      const data = await res.json();
      setAssistants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- MÉDECINS ----------
  const handleMedChange = (e) =>
    setMedForm({ ...medForm, [e.target.name]: e.target.value });

  // Create or update médecin
  const handleSubmitMed = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: medForm.nom,
        prenom: medForm.prenom,
        email: medForm.email,
        specialite: medForm.specialite,
      };
      // include password only if provided (so editing won't overwrite with empty)
      if (medForm.mot_de_passe && medForm.mot_de_passe.trim() !== "") {
        payload.mot_de_passe = medForm.mot_de_passe;
      }

      const url = editingMedId
        ? `http://localhost:3000/api/medecins/${editingMedId}`
        : "http://localhost:3000/api/medecins";
      const method = editingMedId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur médecin");

      setMessage(editingMedId ? "Médecin modifié avec succès !" : "Médecin créé avec succès !");
      // reset form & editing state
      setMedForm({ nom: "", prenom: "", email: "", mot_de_passe: "", specialite: "" });
      setEditingMedId(null);
      fetchMedecins();
    } catch (err) {
      setMessage(err.message || "Erreur réseau");
    }
  };

  // Start editing med: prefill form
  const handleEditMed = (med) => {
    setMedForm({
      nom: med.utilisateur?.nom || "",
      prenom: med.utilisateur?.prenom || "",
      email: med.utilisateur?.email || "",
      mot_de_passe: "", // keep empty for security
      specialite: med.specialite || "",
    });
    setEditingMedId(med.id_med);
    window.scrollTo({ top: 0, behavior: "smooth" }); // bring form into view
  };

  const handleCancelEditMed = () => {
    setMedForm({ nom: "", prenom: "", email: "", mot_de_passe: "", specialite: "" });
    setEditingMedId(null);
  };

  const handleDeleteMed = async (id) => {
    if (!window.confirm("Supprimer ce médecin ?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/medecins/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur suppression");
      }
      setMessage("Médecin supprimé.");
      fetchMedecins();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Erreur suppression");
    }
  };

  // ---------- ASSISTANTS ----------
  const handleAssistantChange = (e) =>
    setAssistantForm({ ...assistantForm, [e.target.name]: e.target.value });

  const handleSubmitAssistant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: assistantForm.nom,
        prenom: assistantForm.prenom,
        email: assistantForm.email,
      };
      if (assistantForm.mot_de_passe && assistantForm.mot_de_passe.trim() !== "") {
        payload.mot_de_passe = assistantForm.mot_de_passe;
      }

      const url = editingAssistantId
        ? `http://localhost:3000/api/assistants/${editingAssistantId}`
        : "http://localhost:3000/api/assistants";
      const method = editingAssistantId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur assistant");

      setMessage(editingAssistantId ? "Assistant modifié avec succès !" : "Assistant créé avec succès !");
      setAssistantForm({ nom: "", prenom: "", email: "", mot_de_passe: "" });
      setEditingAssistantId(null);
      fetchAssistants();
    } catch (err) {
      setMessage(err.message || "Erreur réseau");
    }
  };

  const handleEditAssistant = (a) => {
    setAssistantForm({
      nom: a.utilisateur?.nom || "",
      prenom: a.utilisateur?.prenom || "",
      email: a.utilisateur?.email || "",
      mot_de_passe: "",
    });
    setEditingAssistantId(a.id_assistant);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditAssistant = () => {
    setAssistantForm({ nom: "", prenom: "", email: "", mot_de_passe: "" });
    setEditingAssistantId(null);
  };

  const handleDeleteAssistant = async (id) => {
    if (!window.confirm("Supprimer cet assistant ?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/assistants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur suppression");
      }
      setMessage("Assistant supprimé.");
      fetchAssistants();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Erreur suppression");
    }
  };

  return (
    <div className="admin-page">
      {/* ✅ HEADER AVEC BOUTON DÉCONNEXION */}
      <div className="admin-header">
        <h2 className="page-title">Admin - Gestion des Utilisateurs</h2>
        <button className="btn-logout" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 19H3a2 2 0 01-2-2V3a2 2 0 012-2h4M14 15l5-5-5-5M19 10H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Déconnexion
        </button>
      </div>

      {message && (
        <div className={message.toLowerCase().includes("erreur") ? "error-message" : "success-message"}>
          {message}
        </div>
      )}

      <div className="forms-container">
        <div className="form-box">
          <h3>{editingMedId ? "Modifier Médecin" : "Créer Médecin"}</h3>
          <form onSubmit={handleSubmitMed}>
            <input name="nom" placeholder="Nom" value={medForm.nom} onChange={handleMedChange} required />
            <input name="prenom" placeholder="Prénom" value={medForm.prenom} onChange={handleMedChange} required />
            <input name="email" type="email" placeholder="Email" value={medForm.email} onChange={handleMedChange} required />
            <input
              name="mot_de_passe"
              type="password"
              placeholder={editingMedId ? "Laisser vide pour ne pas changer" : "Mot de passe"}
              value={medForm.mot_de_passe}
              onChange={handleMedChange}
            />
            <input name="specialite" placeholder="Spécialité" value={medForm.specialite} onChange={handleMedChange} required />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" className="btn-primary">
                {editingMedId ? "Enregistrer les modifications" : "Créer Médecin"}
              </button>
              {editingMedId && (
                <button type="button" className="btn-warning" onClick={handleCancelEditMed}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="form-box">
          <h3>{editingAssistantId ? "Modifier Assistant" : "Créer Assistant"}</h3>
          <form onSubmit={handleSubmitAssistant}>
            <input name="nom" placeholder="Nom" value={assistantForm.nom} onChange={handleAssistantChange} required />
            <input name="prenom" placeholder="Prénom" value={assistantForm.prenom} onChange={handleAssistantChange} required />
            <input name="email" type="email" placeholder="Email" value={assistantForm.email} onChange={handleAssistantChange} required />
            <input
              name="mot_de_passe"
              type="password"
              placeholder={editingAssistantId ? "Laisser vide pour ne pas changer" : "Mot de passe"}
              value={assistantForm.mot_de_passe}
              onChange={handleAssistantChange}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" className="btn-primary">
                {editingAssistantId ? "Enregistrer les modifications" : "Créer Assistant"}
              </button>
              {editingAssistantId && (
                <button type="button" className="btn-warning" onClick={handleCancelEditAssistant}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tables */}
      <div className="table-section">
        <h3>Liste des Médecins</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecins.map((m) => (
                <tr key={m.id_med}>
                  <td>{m.id_med}</td>
                  <td>{m.utilisateur?.nom}</td>
                  <td>{m.utilisateur?.prenom}</td>
                  <td>{m.utilisateur?.email}</td>
                  <td>{m.specialite}</td>
                  <td className="actions-cell">
                    <button className="btn-warning" onClick={() => handleEditMed(m)}>
                      Modifier
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteMed(m.id_med)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section">
        <h3>Liste des Assistants</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assistants.map((a) => (
                <tr key={a.id_assistant}>
                  <td>{a.id_assistant}</td>
                  <td>{a.utilisateur?.nom}</td>
                  <td>{a.utilisateur?.prenom}</td>
                  <td>{a.utilisateur?.email}</td>
                  <td className="actions-cell">
                    <button className="btn-warning" onClick={() => handleEditAssistant(a)}>
                      Modifier
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteAssistant(a.id_assistant)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
