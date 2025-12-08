import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [role, setRole] = useState(''); // Vide par défaut
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!role) {
      setMessage('Veuillez sélectionner un rôle');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Erreur lors de la connexion');
        return;
      }

      // Sauvegarder les infos de connexion
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', data.token || 'fake-token');
      localStorage.setItem('user', JSON.stringify(data));

      setMessage(`Connexion réussie ! Bienvenue ${data.prenom}`);

      // Redirection selon le rôle
      const userRole = role.toUpperCase();
      
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'ASSISTANT') {
        navigate('/dashboard');
      } else if (userRole === 'MEDECIN') {
        navigate('/medecin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setMessage('Impossible de se connecter au serveur');
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        {/* Logo */}
        <div className="login-logo">
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
        <h1 className="login-title">MedTrack</h1>
        <p className="login-subtitle">Simplifiez la gestion médicale grâce à l'IA</p>

        {/* Messages */}
        {message && (
          <div className={message.startsWith('Connexion réussie') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        {/* Formulaire */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="votre.email@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={mot_de_passe} 
              onChange={(e) => setMotDePasse(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Sélectionner votre rôle</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Choisir un rôle</option>
              <option value="PATIENT">Patient</option>
              <option value="MEDECIN">Médecin</option>
              <option value="ASSISTANT">Assistant</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <a href="#" className="forgot-link">Mot de passe oublié ?</a>

          <button type="submit" className="login-button">Se connecter</button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          Pas encore de compte ? <a href="/register">Créer un compte</a>
        </p>
      </div>
    </div>
  );
}
