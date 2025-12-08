// services/authService.js
const { Utilisateur } = require('../models');

class AuthService {
  static async login({ email, mot_de_passe, role }) {
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) return null;

    if (user.mot_de_passe !== mot_de_passe) return null;
    if (user.role !== role) return null;

    return {
      id_user: user.id_user,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    };
  }
}

module.exports = AuthService;
