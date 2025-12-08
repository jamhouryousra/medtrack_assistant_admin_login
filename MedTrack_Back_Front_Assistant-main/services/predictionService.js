// services/predictionService.js
const { Prediction, DossierMedical, Medecin } = require('../models');

class PredictionService {
  static async createPrediction(data) {
    const { maladie, probabilite, id_dm, id_med } = data;

    const prediction = await Prediction.create({
      maladie,
      probabilite,
      id_dm,
      id_med,
    });

    return prediction;
  }

  static async getAllPredictions() {
    return Prediction.findAll({
      include: [
        { model: DossierMedical, as: 'dossierMedical' },
        { model: Medecin, as: 'medecin' },
      ],
    });
  }

  static async getPredictionById(id) {
    return Prediction.findByPk(id, {
      include: [
        { model: DossierMedical, as: 'dossierMedical' },
        { model: Medecin, as: 'medecin' },
      ],
    });
  }

  static async updatePrediction(id, data) {
    const prediction = await Prediction.findByPk(id);
    if (!prediction) return null;

    const { maladie, probabilite, id_dm, id_med } = data;

    if (maladie) prediction.maladie = maladie;
    if (probabilite !== undefined) prediction.probabilite = probabilite;
    if (id_dm) prediction.id_dm = id_dm;
    if (id_med) prediction.id_med = id_med;

    await prediction.save();
    return prediction;
  }

  static async deletePrediction(id) {
    const prediction = await Prediction.findByPk(id);
    if (!prediction) return false;

    await prediction.destroy();
    return true;
  }
}

module.exports = PredictionService;
