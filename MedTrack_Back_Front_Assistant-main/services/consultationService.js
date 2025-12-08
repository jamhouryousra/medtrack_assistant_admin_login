// services/consultationService.js
const { Consultation, DossierMedical, Medecin, Patient } = require('../models');

class ConsultationService {
  static async createConsultation(data) {
    const { date_cons, compte_rendu, id_dm, id_med, id_patient } = data;

    const consultation = await Consultation.create({
      date_cons,
      compte_rendu,
      id_dm,
      id_med,
      id_patient,
    });

    return consultation;
  }

  static async getAllConsultations() {
    return Consultation.findAll({
      include: [
        { model: DossierMedical, as: 'dossierMedical' },
        { model: Medecin, as: 'medecin' },
        { model: Patient, as: 'patient' },
      ],
    });
  }

  static async getConsultationById(id) {
    return Consultation.findByPk(id, {
      include: [
        { model: DossierMedical, as: 'dossierMedical' },
        { model: Medecin, as: 'medecin' },
        { model: Patient, as: 'patient' },
      ],
    });
  }

  static async updateConsultation(id, data) {
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return null;

    const { date_cons, compte_rendu, id_dm, id_med, id_patient } = data;

    if (date_cons) consultation.date_cons = date_cons;
    if (compte_rendu) consultation.compte_rendu = compte_rendu;
    if (id_dm) consultation.id_dm = id_dm;
    if (id_med) consultation.id_med = id_med;
    if (id_patient) consultation.id_patient = id_patient;

    await consultation.save();
    return consultation;
  }

  static async deleteConsultation(id) {
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return false;

    await consultation.destroy();
    return true;
  }
}

module.exports = ConsultationService;
