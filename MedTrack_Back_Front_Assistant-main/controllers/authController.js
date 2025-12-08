// controllers/authController.js
const AuthService = require('../services/authService');

class AuthController {
  static async login(req, res) {
    try {
      const { email, mot_de_passe, role } = req.body;

      const user = await AuthService.login({ email, mot_de_passe, role });
      if (!user) {
        return res.status(401).json({ message: 'Identifiants ou rôle incorrects' });
      }

      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = AuthController;
