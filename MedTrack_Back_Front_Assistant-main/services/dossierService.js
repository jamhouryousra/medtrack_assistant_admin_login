// services/dossierService.js
const { DossierMedical, Patient, Medecin } = require('../models');

class DossierService {
  static async createDossier(data) {
    const { numero_dossier, description, id_patient, id_med } = data;

    const dossier = await DossierMedical.create({
      numero_dossier,
      description,
      id_patient,
      id_med,
    });

    return dossier;
  }

  static async getAllDossiers() {
    return DossierMedical.findAll({
      include: [
        { model: Patient, as: 'patient' },
        { model: Medecin, as: 'medecin' },
      ],
    });
  }

  static async getDossierById(id) {
    return DossierMedical.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Medecin, as: 'medecin' },
      ],
    });
  }

  static async updateDossier(id, data) {
    const dossier = await DossierMedical.findByPk(id);
    if (!dossier) return null;

    const { numero_dossier, description, id_patient, id_med } = data;

    if (numero_dossier) dossier.numero_dossier = numero_dossier;
    if (description) dossier.description = description;
    if (id_patient) dossier.id_patient = id_patient;
    if (id_med) dossier.id_med = id_med;

    await dossier.save();
    return dossier;
  }

  static async deleteDossier(id) {
    const dossier = await DossierMedical.findByPk(id);
    if (!dossier) return false;

    await dossier.destroy();
    return true;
  }
}

module.exports = DossierService;
