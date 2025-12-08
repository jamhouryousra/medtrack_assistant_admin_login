import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    date_naissance: '',
    genre: '',
    telephone: '',
    adresse: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Erreur lors de l\'inscription');
        return;
      }

      setMessage('Inscription réussie ! Connectez-vous maintenant.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setMessage('Impossible de se connecter au serveur');
    }
  };

  return (
    <div className="register-page">
      <div className="register-content">
        {/* Logo */}
        <div className="register-logo">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#5B7EED"/>
            <path 
              d="M16 32h10l5-10 10 20 5-10h10" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="register-title">Créer un compte</h1>
        <p className="register-subtitle">Rejoignez MedTrack</p>

        {/* Messages */}
        {message && (
          <div className={message.startsWith('Inscription réussie') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        {/* Formulaire */}
        <form className="register-form" onSubmit={handleRegister}>
          {/* Prénom et Nom sur la même ligne */}
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input 
                name="prenom" 
                placeholder="Jean"
                value={form.prenom} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input 
                name="nom" 
                placeholder="Dupont"
                value={form.nom} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="votre.email@example.com"
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              name="mot_de_passe" 
              placeholder="••••••••"
              value={form.mot_de_passe} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Date de naissance</label>
            <input 
              type="date" 
              name="date_naissance" 
              value={form.date_naissance} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <select 
              name="genre" 
              value={form.genre} 
              onChange={handleChange} 
              required
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input 
              name="telephone" 
              placeholder="+33 6 12 34 56 78"
              value={form.telephone} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <input 
              name="adresse" 
              placeholder="123 Rue de la Santé, Paris"
              value={form.adresse} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="register-button">Créer mon compte</button>
        </form>

        {/* Footer */}
        <p className="register-footer">
          Vous avez déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  );
}
