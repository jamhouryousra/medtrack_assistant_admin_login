// models/Admin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./Utilisateur');

const Admin = sequelize.define('Admin', {
  id_admin: {
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
  tableName: 'Admin',
  timestamps: false,
});

module.exports = Admin;
