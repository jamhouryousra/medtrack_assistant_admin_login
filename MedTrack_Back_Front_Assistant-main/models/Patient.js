// models/Patient.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./Utilisateur');

const Patient = sequelize.define('Patient', {
  id_patient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Utilisateur, key: 'id_user' },
  },
  // champs spécifiques au patient
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  genre: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING(20),
  },
  adresse: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'Patient',
  timestamps: false,
});

module.exports = Patient;
