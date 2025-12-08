// controllers/rendezvousController.js
const RendezVousService = require('../services/rendezvousService');

class RendezVousController {
  static async create(req, res) {
    try {
      const result = await RendezVousService.createRendezVous(req.body);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      return res.status(201).json(result.rdv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur création rendez-vous' });
    }
  }

  static async getAll(req, res) {
    try {
      const rdvs = await RendezVousService.getAllRendezVous(req.query);
      return res.json(rdvs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération rendez-vous' });
    }
  }

  static async getById(req, res) {
    try {
      const rdv = await RendezVousService.getRendezVousById(req.params.id);
      if (!rdv) return res.status(404).json({ message: 'RDV introuvable' });
      return res.json(rdv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération rendez-vous' });
    }
  }

  static async update(req, res) {
    try {
      const result = await RendezVousService.updateRendezVous(req.params.id, req.body);
      if (result.notFound) {
        return res.status(404).json({ message: 'RDV introuvable' });
      }
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      return res.json(result.rdv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur mise à jour rendez-vous' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await RendezVousService.deleteRendezVous(req.params.id);
      if (!ok) return res.status(404).json({ message: 'RDV introuvable' });
      return res.json({ message: 'Rendez-vous supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur suppression rendez-vous' });
    }
  }
}

module.exports = RendezVousController;
