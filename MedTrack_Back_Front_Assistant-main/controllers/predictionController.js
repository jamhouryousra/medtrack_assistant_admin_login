// controllers/predictionController.js
const PredictionService = require('../services/predictionService');

class PredictionController {
  static async create(req, res) {
    try {
      const prediction = await PredictionService.createPrediction(req.body);
      return res.status(201).json(prediction);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la création de la prédiction' });
    }
  }

  static async getAll(req, res) {
    try {
      const predictions = await PredictionService.getAllPredictions();
      return res.json(predictions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des prédictions' });
    }
  }

  static async getById(req, res) {
    try {
      const prediction = await PredictionService.getPredictionById(req.params.id);
      if (!prediction) {
        return res.status(404).json({ message: 'Prédiction introuvable' });
      }
      return res.json(prediction);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération de la prédiction' });
    }
  }

  static async update(req, res) {
    try {
      const prediction = await PredictionService.updatePrediction(req.params.id, req.body);
      if (!prediction) {
        return res.status(404).json({ message: 'Prédiction introuvable' });
      }
      return res.json(prediction);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de la prédiction' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await PredictionService.deletePrediction(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Prédiction introuvable' });
      }
      return res.json({ message: 'Prédiction supprimée' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la suppression de la prédiction' });
    }
  }
}

module.exports = PredictionController;
