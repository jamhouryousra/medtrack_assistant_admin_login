// services/medecinService.js
const { sequelize, Utilisateur, Medecin } = require('../models');

class MedecinService {
  static async createMedecin(data) {
    const t = await sequelize.transaction();
    try {
      const { nom, prenom, email, mot_de_passe, specialite } = data;

      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        mot_de_passe,
        role: 'MEDECIN',
      }, { transaction: t });

      const medecin = await Medecin.create({
        id_user: user.id_user,
        specialite,
      }, { transaction: t });

      await t.commit();
      return { user, medecin };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getAllMedecins() {
    return Medecin.findAll({
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async getMedecinById(id) {
    return Medecin.findByPk(id, {
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async updateMedecin(id, data) {
    const t = await sequelize.transaction();
    try {
      const medecin = await Medecin.findByPk(id, { transaction: t });
      if (!medecin) {
        await t.rollback();
        return null;
      }

      const user = await Utilisateur.findByPk(medecin.id_user, { transaction: t });
      if (!user) {
        await t.rollback();
        return null;
      }

      const { nom, prenom, email, mot_de_passe, specialite } = data;
      if (nom) user.nom = nom;
      if (prenom) user.prenom = prenom;
      if (email) user.email = email;
      if (mot_de_passe) user.mot_de_passe = mot_de_passe;
      if (specialite) medecin.specialite = specialite;

      await user.save({ transaction: t });
      await medecin.save({ transaction: t });

      await t.commit();
      return { user, medecin };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async deleteMedecin(id) {
    const t = await sequelize.transaction();
    try {
      const medecin = await Medecin.findByPk(id, { transaction: t });
      if (!medecin) {
        await t.rollback();
        return false;
      }

      const user = await Utilisateur.findByPk(medecin.id_user, { transaction: t });

      await medecin.destroy({ transaction: t });
      if (user) await user.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = MedecinService;
