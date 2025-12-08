// models/DossierMedical.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Patient = require('./Patient');
const Medecin = require('./Medecin');

const DossierMedical = sequelize.define('DossierMedical', {
  id_dm: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero_dossier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  id_patient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Patient, key: 'id_patient' },
  },
  id_med: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Medecin, key: 'id_med' },
  },
}, {
  tableName: 'DossierMedical',
  timestamps: false,
});

module.exports = DossierMedical;
