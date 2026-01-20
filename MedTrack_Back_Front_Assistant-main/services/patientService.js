// services/patientService.js
const { sequelize, Utilisateur, Patient, RendezVous, Medecin, Assistant, DossierMedical,Consultation } = require('../models');

class PatientService {
  static async createPatient(data) {
    const t = await sequelize.transaction();
    try {
      const {
        nom,
        prenom,
        email,
        mot_de_passe,
        date_naissance,
        genre,
        telephone,
        adresse,
      } = data;

      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        mot_de_passe,
        role: 'PATIENT',
      }, { transaction: t });

      const patient = await Patient.create({
        id_user: user.id_user,
        date_naissance,
        genre,
        telephone,
        adresse,
      }, { transaction: t });

      await t.commit();
      return { user, patient };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getAllPatients() {
    return Patient.findAll({
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
  }

  static async getPatientById(id) {
    const patient = await Patient.findByPk(id, {
      include: {
        model: Utilisateur,
        as: 'utilisateur',
        attributes: { exclude: ['mot_de_passe'] },
      },
    });
    return patient;
  }

  static async updatePatient(id, data) {
    const t = await sequelize.transaction();
    try {
      const patient = await Patient.findByPk(id, { transaction: t });
      if (!patient) {
        await t.rollback();
        return null;
      }

      const user = await Utilisateur.findByPk(patient.id_user, { transaction: t });
      if (!user) {
        await t.rollback();
        return null;
      }

      const {
        nom,
        prenom,
        email,
        mot_de_passe,
        date_naissance,
        genre,
        telephone,
        adresse,
      } = data;

      if (nom) user.nom = nom;
      if (prenom) user.prenom = prenom;
      if (email) user.email = email;
      if (mot_de_passe) user.mot_de_passe = mot_de_passe;

      if (date_naissance) patient.date_naissance = date_naissance;
      if (genre) patient.genre = genre;
      if (telephone) patient.telephone = telephone;
      if (adresse) patient.adresse = adresse;

      await user.save({ transaction: t });
      await patient.save({ transaction: t });

      await t.commit();
      return { user, patient };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async deletePatient(id) {
    const t = await sequelize.transaction();
    try {
      const patient = await Patient.findByPk(id, { transaction: t });
      if (!patient) {
        await t.rollback();
        return false;
      }

      const user = await Utilisateur.findByPk(patient.id_user, { transaction: t });

      await patient.destroy({ transaction: t });
      if (user) await user.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
  static async getPatientRendezVous(id_patient) {
  return RendezVous.findAll({
    where: { id_patient },
    order: [
      ['date_rdv', 'DESC'],
      ['heure_debut', 'DESC'],
    ],
    include: [
      { model: Medecin, as: 'medecin' },
      { model: Assistant, as: 'assistant' },
    ],
  });
}
static async getDossierComplet(id_patient) {
  const patient = await Patient.findByPk(id_patient, {
    include: {
      model: Utilisateur,
      as: 'utilisateur'
    }
  });
  if (!patient) return null;

  const dossier = await DossierMedical.findOne({
    where: { id_patient }
  });
  if (!dossier) return null;

  const consultations = await Consultation.findAll({
    where: { id_patient },
    order: [['date_cons', 'DESC']],
    include: [{ model: Medecin, as: 'medecin' }]
  });

  return {
    patient,
    dossierMedical: dossier,
    consultations
  };
}
}

module.exports = PatientService;
