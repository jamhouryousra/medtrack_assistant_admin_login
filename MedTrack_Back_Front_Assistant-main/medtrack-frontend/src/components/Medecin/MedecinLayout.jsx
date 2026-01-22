import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MedecinSidebar from './MedecinSidebar';
import MedecinHeader from './MedecinHeader';
import MedecinDashboard from './MedecinDashboard';
import MesRendezvous from './MesRendezvous';
import MesPatients from './MesPatients';
import Consultations from './Consultations';
import PredictionsIA from './PredictionsIA';
import ProfilMedecin from './ProfilMedecin';
import './MedecinLayout.css';

const MedecinLayout = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    nom: 'Médical',
    prenom: 'Dr.',
    role: 'MEDECIN',
    email: 'medecin@medtrack.fr',
    specialite: 'Médecine Générale'
  };

  return (
    <div className="medecin-container">
      <MedecinSidebar />
      <div className="medecin-main">
        <MedecinHeader user={user} />
        <div className="medecin-content">
          <Routes>
            <Route path="dashboard" element={<MedecinDashboard />} />
            <Route path="rendez-vous" element={<MesRendezvous />} />
            <Route path="patients" element={<MesPatients />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="consultations/new/:patientId?" element={<Consultations />} />
            <Route path="consultations/:id" element={<Consultations />} />
            <Route path="predictions-ia" element={<PredictionsIA />} />
            <Route path="profil" element={<ProfilMedecin />} />
            <Route path="*" element={<Navigate to="/medecin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MedecinLayout;