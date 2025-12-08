// models/Medecin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./Utilisateur');

const Medecin = sequelize.define('Medecin', {
  id_med: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Utilisateur, key: 'id_user' },
  },
  specialite: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'Medecin',
  timestamps: false,
});

module.exports = Medecin;
