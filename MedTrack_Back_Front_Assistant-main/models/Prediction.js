// models/Prediction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const DossierMedical = require('./DossierMedical');
const Medecin = require('./Medecin');

const Prediction = sequelize.define('Prediction', {
  id_pred: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  maladie: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  probabilite: {
    type: DataTypes.FLOAT,
  },
  id_dm: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // 1–1 avec DossierMedical
    references: { model: DossierMedical, key: 'id_dm' },
  },
  id_med: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Medecin, key: 'id_med' },
  },
}, {
  tableName: 'Prediction',
  timestamps: false,
});

module.exports = Prediction;
