// models/Assistant.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./Utilisateur');

const Assistant = sequelize.define('Assistant', {
  id_assistant: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Utilisateur, key: 'id_user' },
  },
}, {
  tableName: 'Assistant',
  timestamps: false,
});

module.exports = Assistant;
