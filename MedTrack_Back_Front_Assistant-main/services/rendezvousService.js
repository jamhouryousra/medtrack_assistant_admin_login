// services/rendezvousService.js
const { RendezVous, Patient, Medecin, Assistant } = require('../models');
const { Op } = require('sequelize');

class RendezVousService {
  static async checkOverlap({ id_med, date_rdv, heure_debut, heure_fin, ignoreId = null }) {
    const where = {
      id_med,
      date_rdv,
      statut: { [Op.ne]: 'ANNULE' },
      [Op.or]: [
        {
          heure_debut: { [Op.lte]: heure_debut },
          heure_fin:   { [Op.gt]: heure_debut },
        },
        {
          heure_debut: { [Op.lt]: heure_fin },
          heure_fin:   { [Op.gte]: heure_fin },
        },
        {
          heure_debut: { [Op.gte]: heure_debut },
          heure_fin:   { [Op.lte]: heure_fin },
        },
      ],
    };

    if (ignoreId) {
      where.id_rdv = { [Op.ne]: ignoreId };
    }

    const conflit = await RendezVous.findOne({ where });
    return !!conflit;
  }

  static async createRendezVous(data) {
    const { id_patient, id_med, id_assistant, date_rdv, heure_debut, heure_fin } = data;

    const overlap = await this.checkOverlap({ id_med, date_rdv, heure_debut, heure_fin });
    if (overlap) {
      return { error: 'Chevauchement de rendez-vous pour ce médecin.' };
    }

    const rdv = await RendezVous.create({
      id_patient,
      id_med,
      id_assistant,
      date_rdv,
      heure_debut,
      heure_fin,
      statut: 'PLANIFIE',
    });

    return { rdv };
  }

  static async getAllRendezVous(filters) {
    const { id_patient, id_med, date } = filters;
    const where = {};
    if (id_patient) where.id_patient = id_patient;
    if (id_med) where.id_med = id_med;
    if (date) where.date_rdv = date;

    return RendezVous.findAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Medecin, as: 'medecin' },
        { model: Assistant, as: 'assistant' },
      ],
    });
  }

  static async getRendezVousById(id) {
    return RendezVous.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Medecin, as: 'medecin' },
        { model: Assistant, as: 'assistant' },
      ],
    });
  }

  static async updateRendezVous(id, data) {
    const rdv = await RendezVous.findByPk(id);
    if (!rdv) return { notFound: true };

    const { date_rdv, heure_debut, heure_fin, statut } = data;

    const overlap = await this.checkOverlap({
      id_med: rdv.id_med,
      date_rdv,
      heure_debut,
      heure_fin,
      ignoreId: rdv.id_rdv,
    });

    if (overlap) {
      return { error: 'Chevauchement de rendez-vous pour ce médecin.' };
    }

    if (date_rdv) rdv.date_rdv = date_rdv;
    if (heure_debut) rdv.heure_debut = heure_debut;
    if (heure_fin) rdv.heure_fin = heure_fin;
    if (statut) rdv.statut = statut;

    await rdv.save();
    return { rdv };
  }

  static async deleteRendezVous(id) {
    const rdv = await RendezVous.findByPk(id);
    if (!rdv) return false;

    await rdv.destroy();
    return true;
  }
}

module.exports = RendezVousService;
