import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Patients from './components/Patients/Patients';
import Rendezvous from './components/Rendezvous/Rendezvous';
import Profil from './components/Profil/Profil';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Admin from './components/Admin/Admin';

// Composants Patient
import PatientSidebar from './components/Patient/PatientSidebar';
import PatientHeader from './components/Patient/PatientHeader';
import PatientDashboard from './components/Patient/PatientDashboard';
import PatientAppointments from './components/Patient/PatientAppointments';
import PatientAnalyses from './components/Patient/PatientAnalyses';
import PatientConsultations from './components/Patient/PatientConsultations';
import PatientProfile from './components/Patient/PatientProfile';

// ✅ AJOUT : Import du NotificationProvider
import { NotificationProvider } from './contexts/NotificationContext';

import './App.css';

// Composant pour protéger les routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role?.toUpperCase())) {
    if (user.role?.toUpperCase() === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role?.toUpperCase() === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

// Layout pour l'Assistant (avec Sidebar + Header)
const AssistantLayout = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    nom: 'Assistant',
    prenom: 'Médical',
    role: 'ASSISTANT',
    email: 'assistant@medtrack.fr'
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />
        <div className="page-content">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="rendezvous" element={<Rendezvous />} />
            <Route path="profil" element={<Profil />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Layout pour le Patient (avec PatientSidebar + PatientHeader)
const PatientLayout = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    nom: 'Patient',
    prenom: 'Utilisateur',
    role: 'PATIENT',
    email: 'patient@medtrack.fr'
  };

  return (
    <div className="app-container">
      <PatientSidebar />
      <div className="main-content">
        <PatientHeader user={user} />
        <div className="page-content">
          <Routes>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="analyses" element={<PatientAnalyses />} />
            <Route path="consultations" element={<PatientConsultations />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* ✅ WRAPPER avec NotificationProvider */}
      <NotificationProvider>
        <Routes>
          {/* Routes publiques (Login / Register) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Route ADMIN (pas de Sidebar/Header) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Admin />
              </ProtectedRoute>
            } 
          />

          {/* Routes PATIENT (avec PatientSidebar/PatientHeader) */}
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientLayout />
              </ProtectedRoute>
            } 
          />

          {/* Routes ASSISTANT (avec Sidebar/Header) */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout />
              </ProtectedRoute>
            } 
          />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;