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

      //  Données utilisateur complètes (incluant id_patient, id_assistant, etc.)
      let userToStore = { ...data };

      //  RÉCUPÉRER L'ID SPÉCIFIQUE SELON LE RÔLE
      const userRole = role.toUpperCase();

      try {
        //  SI PATIENT : Récupérer id_patient
        if (userRole === 'PATIENT') {
          console.log('👤 Récupération de id_patient...');
          const patientsResponse = await fetch('http://localhost:3000/api/patients');
          const patients = await patientsResponse.json();
          const patientsData = Array.isArray(patients) ? patients : patients.data || [];
          
          const currentPatient = patientsData.find(p => p.id_user === data.id_user);
          
          if (currentPatient) {
            console.log(' Patient trouvé:', currentPatient);
            userToStore.id_patient = currentPatient.id_patient;
          } else {
            console.warn(' Patient non trouvé pour id_user:', data.id_user);
          }
        }

        // 🔵 SI ASSISTANT : Récupérer id_assistant
        if (userRole === 'ASSISTANT') {
          console.log('👤 Récupération de id_assistant...');
          const assistantsResponse = await fetch('http://localhost:3000/api/assistants');
          const assistants = await assistantsResponse.json();
          const assistantsData = Array.isArray(assistants) ? assistants : assistants.data || [];
          
          const currentAssistant = assistantsData.find(a => a.id_user === data.id_user);
          
          if (currentAssistant) {
            console.log(' Assistant trouvé:', currentAssistant);
            userToStore.id_assistant = currentAssistant.id_assistant;
          } else {
            console.warn('Assistant non trouvé pour id_user:', data.id_user);
          }
        }

        // 🔵 SI MEDECIN : Récupérer id_med
        if (userRole === 'MEDECIN') {
          console.log('👤 Récupération de id_med...');
          const medecinsResponse = await fetch('http://localhost:3000/api/medecins');
          const medecins = await medecinsResponse.json();
          const medecinsData = Array.isArray(medecins) ? medecins : medecins.data || [];
          
          const currentMedecin = medecinsData.find(m => m.id_user === data.id_user);
          
          if (currentMedecin) {
            console.log('Médecin trouvé:', currentMedecin);
            userToStore.id_med = currentMedecin.id_med;
            userToStore.specialite = currentMedecin.specialite;
          } else {
            console.warn('Médecin non trouvé pour id_user:', data.id_user);
          }
        }
      } catch (error) {
        console.error(' Erreur lors de la récupération de l\'ID:', error);
        // Continue quand même, l'ID sera récupéré plus tard si nécessaire
      }

      // Sauvegarder les infos de connexion avec l'ID complet
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', data.token || 'fake-token');
      localStorage.setItem('user', JSON.stringify(userToStore)); //  Avec id_patient, id_assistant, ou id_med
      
      console.log('💾 Données stockées:', userToStore);

      setMessage(`Connexion réussie ! Bienvenue ${data.prenom}`);

      // Redirection selon le rôle
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'ASSISTANT') {
        navigate('/dashboard');
      } else if (userRole === 'MEDECIN') {
        navigate('/medecin');
      } else if (userRole === 'PATIENT') {
        navigate('/patient/dashboard');
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