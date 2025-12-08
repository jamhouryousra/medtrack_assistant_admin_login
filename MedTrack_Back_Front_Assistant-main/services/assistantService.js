// services/assistantService.js
const { sequelize, Utilisateur, Assistant } = require('../models');

class AssistantService {
  static async createAssistant(data) {
    const t = await sequelize.transaction();
    try {
      const { nom, prenom, email, mot_de_passe } = data;

      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        mot_de_passe,
        role: 'ASSISTANT',
      }, { transaction: t });

      const assistant = await Assistant.create({
        id_user: user.id_user,
      }, { transaction: t });

      await t.commit();
      return { user, assistant };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getAllAssistants() {
    return Assistant.findAll({
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async getAssistantById(id) {
    return Assistant.findByPk(id, {
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async updateAssistant(id, data) {
    const t = await sequelize.transaction();
    try {
      const assistant = await Assistant.findByPk(id, { transaction: t });
      if (!assistant) {
        await t.rollback();
        return null;
      }

      const user = await Utilisateur.findByPk(assistant.id_user, { transaction: t });
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
      return { user, assistant };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async deleteAssistant(id) {
    const t = await sequelize.transaction();
    try {
      const assistant = await Assistant.findByPk(id, { transaction: t });
      if (!assistant) {
        await t.rollback();
        return false;
      }

      const user = await Utilisateur.findByPk(assistant.id_user, { transaction: t });

      await assistant.destroy({ transaction: t });
      if (user) await user.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = AssistantService;
