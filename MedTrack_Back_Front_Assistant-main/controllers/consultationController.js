// controllers/consultationController.js
const ConsultationService = require('../services/consultationService');

class ConsultationController {
  static async create(req, res) {
    try {
      const consultation = await ConsultationService.createConsultation(req.body);
      return res.status(201).json(consultation);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la création de la consultation' });
    }
  }

  static async getAll(req, res) {
    try {
      const consultations = await ConsultationService.getAllConsultations();
      return res.json(consultations);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des consultations' });
    }
  }

  static async getById(req, res) {
    try {
      const consultation = await ConsultationService.getConsultationById(req.params.id);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
      return res.json(consultation);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération de la consultation' });
    }
  }

  static async update(req, res) {
    try {
      const consultation = await ConsultationService.updateConsultation(req.params.id, req.body);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
      return res.json(consultation);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de la consultation' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await ConsultationService.deleteConsultation(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
      return res.json({ message: 'Consultation supprimée' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la suppression de la consultation' });
    }
  }
}

module.exports = ConsultationController;
