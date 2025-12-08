// models/Consultation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const DossierMedical = require('./DossierMedical');
const Medecin = require('./Medecin');
const Patient = require('./Patient');

const Consultation = sequelize.define('Consultation', {
  id_cons: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date_cons: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  compte_rendu: {
    type: DataTypes.TEXT,
  },
  id_dm: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: DossierMedical, key: 'id_dm' },
  },
  id_med: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Medecin, key: 'id_med' },
  },
  id_patient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Patient, key: 'id_patient' },
  },
}, {
  tableName: 'Consultation',
  timestamps: false,
});

module.exports = Consultation;
