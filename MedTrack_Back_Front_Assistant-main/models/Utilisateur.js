// models/Utilisateur.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Utilisateur = sequelize.define('Utilisateur', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'ASSISTANT', 'MEDECIN', 'PATIENT'),
    allowNull: false,
  },
}, {
  tableName: 'Utilisateur',
  timestamps: false,
});

module.exports = Utilisateur;
