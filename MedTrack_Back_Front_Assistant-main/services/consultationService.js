// services/consultationService.js
const { Consultation, DossierMedical, RendezVous } = require('../models');
const { Op } = require('sequelize');

class ConsultationService {
  static _dateOnly(dateTimeStr) {
    // "2025-12-10T17:45:00" -> "2025-12-10"
    if (!dateTimeStr) return null;
    return String(dateTimeStr).slice(0, 10);
  }

  static async _checkDossierPatient(id_dm, id_patient) {
    const dossier = await DossierMedical.findByPk(id_dm);
    if (!dossier) return { error: 'Dossier médical introuvable.' };

    if (Number(dossier.id_patient) !== Number(id_patient)) {
      return { error: 'Le dossier médical ne correspond pas à ce patient.' };
    }

    return { dossier };
  }

  static async _checkRdvSameDay({ id_patient, id_med, date_cons }) {
    const day = this._dateOnly(date_cons);
    if (!day) return { error: "date_cons est obligatoire." };

    const rdv = await RendezVous.findOne({
      where: {
        id_patient,
        id_med,
        date_rdv: day,
        statut: { [Op.ne]: 'ANNULE' }, // on ignore les RDV annulés
      }
    });

    if (!rdv) {
      return { error: "Impossible : aucun rendez-vous trouvé pour ce patient avec ce médecin à cette date." };
    }

    return { rdv };
  }

// ✅ CREATE
  static async createConsultation(data) {
    const { date_cons, compte_rendu, id_dm, id_med, id_patient } = data;

    // 1) cohérence dossier ↔ patient
    const checkDP = await this._checkDossierPatient(id_dm, id_patient);
    if (checkDP.error) return { error: checkDP.error };

    // 2) consultation doit être le même jour qu'un RDV patient-médecin
    const checkRdv = await this._checkRdvSameDay({ id_patient, id_med, date_cons });
    if (checkRdv.error) return { error: checkRdv.error };

    const consultation = await Consultation.create({
      date_cons,
      compte_rendu,
      id_dm,
      id_med,
      id_patient,
    });

    return { consultation };
  }

  // READ all (avec filtres optionnels)
  static async getAllConsultations(filters = {}) {
    const where = {};
    if (filters.id_patient) where.id_patient = filters.id_patient;
    if (filters.id_med) where.id_med = filters.id_med;
    if (filters.id_dm) where.id_dm = filters.id_dm;
    if (filters.date) where.date_cons = filters.date; // si DATEONLY chez toi sinon à adapter

    return Consultation.findAll({ where });
  }

  // READ one
  static async getConsultationById(id) {
    return Consultation.findByPk(id);
  }

  // ✅ UPDATE
  static async updateConsultation(id, data) {
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return { notFound: true };

    // valeurs effectives (anciennes si pas envoyées)
    const newDateCons = data.date_cons ?? consultation.date_cons;
    const newIdDm = data.id_dm ?? consultation.id_dm;
    const newIdMed = data.id_med ?? consultation.id_med;
    const newIdPatient = data.id_patient ?? consultation.id_patient;

    // 1) cohérence dossier ↔ patient (avec valeurs effectives)
    const checkDP = await this._checkDossierPatient(newIdDm, newIdPatient);
    if (checkDP.error) return { error: checkDP.error };

    // 2) règle RDV même jour (avec valeurs effectives)
    const checkRdv = await this._checkRdvSameDay({
      id_patient: newIdPatient,
      id_med: newIdMed,
      date_cons: newDateCons
    });
    if (checkRdv.error) return { error: checkRdv.error };

    // appliquer updates
    if (data.date_cons) consultation.date_cons = data.date_cons;
    if (data.compte_rendu !== undefined) consultation.compte_rendu = data.compte_rendu;
    if (data.id_dm) consultation.id_dm = data.id_dm;
    if (data.id_med) consultation.id_med = data.id_med;
    if (data.id_patient) consultation.id_patient = data.id_patient;

    await consultation.save();
    return { consultation };
  }

  // DELETE
  static async deleteConsultation(id) {
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return { notFound: true };

    await consultation.destroy();
    return { ok: true };
  }
}

module.exports = ConsultationService;
