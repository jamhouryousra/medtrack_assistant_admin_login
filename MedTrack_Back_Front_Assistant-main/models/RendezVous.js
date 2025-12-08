// models/RendezVous.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Patient = require('./Patient');
const Assistant = require('./Assistant');
const Medecin = require('./Medecin');

const RendezVous = sequelize.define('RendezVous', {
  id_rdv: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date_rdv: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  heure_debut: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  heure_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('PLANIFIE', 'ANNULE', 'TERMINE'),
    defaultValue: 'PLANIFIE',
  },
  id_patient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Patient, key: 'id_patient' },
  },
  id_assistant: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Assistant, key: 'id_assistant' },
  },
  id_med: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Medecin, key: 'id_med' },
  },
}, {
  tableName: 'RendezVous',
  timestamps: false,
});

module.exports = RendezVous;
