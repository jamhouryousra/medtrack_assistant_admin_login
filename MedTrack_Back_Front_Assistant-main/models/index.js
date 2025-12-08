const sequelize = require('../db');

const Utilisateur = require('./Utilisateur');
const Admin = require('./Admin');
const Assistant = require('./Assistant');
const Medecin = require('./Medecin');
const Patient = require('./Patient');
const DossierMedical = require('./DossierMedical');
const RendezVous = require('./RendezVous');
const Consultation = require('./Consultation');
const Prediction = require('./Prediction');

// ===== HÉRITAGE =====
Utilisateur.hasOne(Admin, { foreignKey: 'id_user', as: 'admin' });
Admin.belongsTo(Utilisateur, { foreignKey: 'id_user', as: 'utilisateur' });

Utilisateur.hasOne(Assistant, { foreignKey: 'id_user', as: 'assistant' });
Assistant.belongsTo(Utilisateur, { foreignKey: 'id_user', as: 'utilisateur' });

Utilisateur.hasOne(Medecin, { foreignKey: 'id_user', as: 'medecin' });
Medecin.belongsTo(Utilisateur, { foreignKey: 'id_user', as: 'utilisateur' });

Utilisateur.hasOne(Patient, { foreignKey: 'id_user', as: 'patient' });
Patient.belongsTo(Utilisateur, { foreignKey: 'id_user', as: 'utilisateur' });

// ===== PATIENT / DOSSIER / RENDEZVOUS / CONSULTATION =====

// Patient 1–1 DossierMedical
Patient.hasOne(DossierMedical, { foreignKey: 'id_patient', as: 'dossierMedical' });
DossierMedical.belongsTo(Patient, { foreignKey: 'id_patient', as: 'patient' });

// Medecin 1–N DossierMedical
Medecin.hasMany(DossierMedical, { foreignKey: 'id_med', as: 'dossiers' });
DossierMedical.belongsTo(Medecin, { foreignKey: 'id_med', as: 'medecin' });

// Patient 1–N RendezVous
Patient.hasMany(RendezVous, { foreignKey: 'id_patient', as: 'rendezVous' });
RendezVous.belongsTo(Patient, { foreignKey: 'id_patient', as: 'patient' });

// Assistant 1–N RendezVous
Assistant.hasMany(RendezVous, { foreignKey: 'id_assistant', as: 'rendezVous' });
RendezVous.belongsTo(Assistant, { foreignKey: 'id_assistant', as: 'assistant' });

// Patient 1–N Consultation
Patient.hasMany(Consultation, { foreignKey: 'id_patient', as: 'consultations' });
Consultation.belongsTo(Patient, { foreignKey: 'id_patient', as: 'patient' });

// DossierMedical 1–N Consultation
DossierMedical.hasMany(Consultation, { foreignKey: 'id_dm', as: 'consultations' });
Consultation.belongsTo(DossierMedical, { foreignKey: 'id_dm', as: 'dossierMedical' });

// Medecin 1–N Consultation
Medecin.hasMany(Consultation, { foreignKey: 'id_med', as: 'consultations' });
Consultation.belongsTo(Medecin, { foreignKey: 'id_med', as: 'medecin' });

// ===== PREDICTION =====

// DossierMedical 1–1 Prediction
DossierMedical.hasOne(Prediction, { foreignKey: 'id_dm', as: 'prediction' });
Prediction.belongsTo(DossierMedical, { foreignKey: 'id_dm', as: 'dossierMedical' });

// Medecin 1–N Prediction
Medecin.hasMany(Prediction, { foreignKey: 'id_med', as: 'predictions' });
Prediction.belongsTo(Medecin, { foreignKey: 'id_med', as: 'medecin' });

// Medecin 1–N RendezVous
Medecin.hasMany(RendezVous, { foreignKey: 'id_med', as: 'rendezVous' });
RendezVous.belongsTo(Medecin, { foreignKey: 'id_med', as: 'medecin' });


module.exports = {
  sequelize,
  Utilisateur,
  Admin,
  Assistant,
  Medecin,
  Patient,
  DossierMedical,
  RendezVous,
  Consultation,
  Prediction,
};
