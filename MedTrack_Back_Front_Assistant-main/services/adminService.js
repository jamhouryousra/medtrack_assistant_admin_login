// services/adminService.js
const { sequelize, Utilisateur, Admin } = require('../models');

class AdminService {
  static async createAdmin(data) {
    const t = await sequelize.transaction();
    try {
      const { nom, prenom, email, mot_de_passe } = data;

      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        mot_de_passe,
        role: 'ADMIN',
      }, { transaction: t });

      const admin = await Admin.create({
        id_user: user.id_user,
      }, { transaction: t });

      await t.commit();
      return { user, admin };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getAllAdmins() {
    return Admin.findAll({
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async getAdminById(id) {
    return Admin.findByPk(id, {
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async updateAdmin(id, data) {
    const t = await sequelize.transaction();
    try {
      const admin = await Admin.findByPk(id, { transaction: t });
      if (!admin) {
        await t.rollback();
        return null;
      }

      const user = await Utilisateur.findByPk(admin.id_user, { transaction: t });
      if (!user) {
        await t.rollback();
        return null;
      }

      const { nom, prenom, email, mot_de_passe } = data;
      if (nom) user.nom = nom;
      if (prenom) user.prenom = prenom;
      if (email) user.email = email;
      if (mot_de_passe) user.mot_de_passe = mot_de_passe;

      await user.save({ transaction: t });
      await t.commit();

      return { user, admin };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async deleteAdmin(id) {
    const t = await sequelize.transaction();
    try {
      const admin = await Admin.findByPk(id, { transaction: t });
      if (!admin) {
        await t.rollback();
        return false;
      }

      const user = await Utilisateur.findByPk(admin.id_user, { transaction: t });

      await admin.destroy({ transaction: t });
      if (user) await user.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = AdminService;
