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

  statut_tabag: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  pression_sanguine: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  taux_glucose: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  bmi: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  maladie: {
    type: DataTypes.STRING,
    allowNull: true,
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
