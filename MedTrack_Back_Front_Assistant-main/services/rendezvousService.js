// services/rendezvousService.js
const { RendezVous, Patient, Medecin, Assistant } = require('../models');
const { Op } = require('sequelize');

class RendezVousService {
    static async hasOverlap({ id_med, date_rdv, heure_debut, heure_fin, ignoreId = null }) {
    const where = {
      id_med,
      date_rdv,
      statut: { [Op.ne]: 'ANNULE' },
      [Op.and]: [
        { heure_debut: { [Op.lt]: heure_fin } },  // début existant < fin nouvelle
        { heure_fin:   { [Op.gt]: heure_debut } } // fin existante > début nouvelle
      ]
    };

    if (ignoreId) {
      where.id_rdv = { [Op.ne]: ignoreId };
    }

    const conflit = await RendezVous.findOne({ where });
    return !!conflit;
  }
  

  static async createRendezVous(data) {
    const { id_patient, id_med, id_assistant, date_rdv, heure_debut, heure_fin } = data;

    // 1) interdire un rendez-vous dans le passé (par rapport à la date du système)
    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    if (date_rdv < todayStr) {
      return { error: 'Impossible de créer un rendez-vous dans le passé.' };
    }

    // 2) vérif chevauchement pour le médecin (comme avant)
    const overlap = await this.hasOverlap({ id_med, date_rdv, heure_debut, heure_fin });
    if (overlap) {
      return { error: 'Chevauchement de rendez-vous pour ce médecin.' };
    }

    // 3) on force le statut initial à PLANIFIE
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

  
  const newDate = date_rdv || rdv.date_rdv;
  const newHeureDebut = heure_debut || rdv.heure_debut;
  const newHeureFin = heure_fin || rdv.heure_fin;

  
  if (date_rdv || heure_debut || heure_fin) {
    const overlap = await this.hasOverlap({
      id_med: rdv.id_med,
      date_rdv: newDate,
      heure_debut: newHeureDebut,
      heure_fin: newHeureFin,
      ignoreId: rdv.id_rdv,
    });

    if (overlap) {
      return { error: 'Ce créneau est déjà pris pour ce médecin.' };
    }
  }

  
  const now = new Date();
  const endDateTime = new Date(`${newDate}T${newHeureFin}`);
  let newStatut = statut ?? rdv.statut;

  if (endDateTime > now) {
    if (newStatut === 'TERMINE') {
      return { error: 'Un rendez-vous ne peut pas être terminé dans le futur.' };
    }
  } else {
    if (!newStatut || newStatut === 'PLANIFIE') {
      newStatut = 'TERMINE';
    }
    if (newStatut !== 'TERMINE' && newStatut !== 'ANNULE') {
      newStatut = 'TERMINE';
    }
  }

  
  rdv.date_rdv = newDate;
  rdv.heure_debut = newHeureDebut;
  rdv.heure_fin = newHeureFin;
  if (newStatut) rdv.statut = newStatut;

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
