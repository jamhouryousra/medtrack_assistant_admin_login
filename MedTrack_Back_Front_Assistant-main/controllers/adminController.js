// controllers/adminController.js
const AdminService = require('../services/adminService');

class AdminController {
  static async create(req, res) {
    try {
      const result = await AdminService.createAdmin(req.body);
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur création admin' });
    }
  }

  static async getAll(req, res) {
    try {
      const admins = await AdminService.getAllAdmins();
      return res.json(admins);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération admins' });
    }
  }

  static async getById(req, res) {
    try {
      const admin = await AdminService.getAdminById(req.params.id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin introuvable' });
      }
      return res.json(admin);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération admin' });
    }
  }

  static async update(req, res) {
    try {
      const result = await AdminService.updateAdmin(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ message: 'Admin introuvable' });
      }
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur mise à jour admin' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await AdminService.deleteAdmin(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Admin introuvable' });
      }
      return res.json({ message: 'Admin supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur suppression admin' });
    }
  }
}

module.exports = AdminController;
