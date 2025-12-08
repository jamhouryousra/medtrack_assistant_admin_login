// controllers/dossierController.js
const DossierService = require('../services/dossierService');

class DossierController {
  static async create(req, res) {
    try {
      const dossier = await DossierService.createDossier(req.body);
      return res.status(201).json(dossier);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la création du dossier médical' });
    }
  }

  static async getAll(req, res) {
    try {
      const dossiers = await DossierService.getAllDossiers();
      return res.json(dossiers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers médicaux' });
    }
  }

  static async getById(req, res) {
    try {
      const dossier = await DossierService.getDossierById(req.params.id);
      if (!dossier) {
        return res.status(404).json({ message: 'Dossier médical introuvable' });
      }
      return res.json(dossier);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du dossier médical' });
    }
  }

  static async update(req, res) {
    try {
      const dossier = await DossierService.updateDossier(req.params.id, req.body);
      if (!dossier) {
        return res.status(404).json({ message: 'Dossier médical introuvable' });
      }
      return res.json(dossier);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier médical' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await DossierService.deleteDossier(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Dossier médical introuvable' });
      }
      return res.json({ message: 'Dossier médical supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la suppression du dossier médical' });
    }
  }
}

module.exports = DossierController;
