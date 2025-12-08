// controllers/medecinController.js
const MedecinService = require('../services/medecinService');

class MedecinController {
  static async create(req, res) {
    try {
      const result = await MedecinService.createMedecin(req.body);
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur création médecin' });
    }
  }

  static async getAll(req, res) {
    try {
      const medecins = await MedecinService.getAllMedecins();
      return res.json(medecins);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération médecins' });
    }
  }

  static async getById(req, res) {
    try {
      const medecin = await MedecinService.getMedecinById(req.params.id);
      if (!medecin) {
        return res.status(404).json({ message: 'Médecin introuvable' });
      }
      return res.json(medecin);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération médecin' });
    }
  }

  static async update(req, res) {
    try {
      const result = await MedecinService.updateMedecin(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ message: 'Médecin introuvable' });
      }
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur mise à jour médecin' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await MedecinService.deleteMedecin(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Médecin introuvable' });
      }
      return res.json({ message: 'Médecin supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur suppression médecin' });
    }
  }
}

module.exports = MedecinController;
