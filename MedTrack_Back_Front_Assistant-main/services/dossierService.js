// services/dossierService.js
const { DossierMedical } = require('../models');

class DossierService {
  // helper : vérifier 1–1 patient↔dossier
  static async _patientHasDossier(id_patient, ignoreId = null) {
    const where = { id_patient };
    if (ignoreId) where.id_dm = { [require('sequelize').Op.ne]: ignoreId };
    const existing = await DossierMedical.findOne({ where });
    return !!existing;
  }

  // CREATE
static async createDossier(data) {
  const {
    numero_dossier,
    description,
    statut_tabag,
    pression_sanguine,
    taux_glucose,
    bmi,
    maladie,
    id_patient,
    id_med
  } = data;

  const already = await DossierMedical.findOne({ where: { id_patient } });
  if (already) {
    return { error: 'Ce patient possède déjà un dossier médical.' };
  }

  const dossier = await DossierMedical.create({
    numero_dossier,
    description,
    statut_tabag,
    pression_sanguine,
    taux_glucose,
    bmi,
    maladie,
    id_patient,
    id_med,
  });

  return { dossier };
}


  // READ all (filtres optionnels)
  static async getAllDossiers(filters = {}) {
    const where = {};
    if (filters.id_patient) where.id_patient = filters.id_patient;
    if (filters.id_med) where.id_med = filters.id_med;

    return DossierMedical.findAll({ where });
  }

  // READ one
  static async getDossierById(id) {
    return DossierMedical.findByPk(id);
  }

  // UPDATE
static async updateDossier(id, data) {
  const dossier = await DossierMedical.findByPk(id);
  if (!dossier) return { notFound: true };

  const {
    numero_dossier,
    description,
    statut_tabag,
    pression_sanguine,
    taux_glucose,
    bmi,
    maladie,
    id_med
  } = data;

  if (numero_dossier) dossier.numero_dossier = numero_dossier;
  if (description !== undefined) dossier.description = description;
  if (statut_tabag !== undefined) dossier.statut_tabag = statut_tabag;
  if (pression_sanguine !== undefined) dossier.pression_sanguine = pression_sanguine;
  if (taux_glucose !== undefined) dossier.taux_glucose = taux_glucose;
  if (bmi !== undefined) dossier.bmi = bmi;
  if (maladie !== undefined) dossier.maladie = maladie;
  if (id_med) dossier.id_med = id_med;

  await dossier.save();
  return { dossier };
}


  // DELETE
  static async deleteDossier(id) {
    const dossier = await DossierMedical.findByPk(id);
    if (!dossier) return { notFound: true };

    await dossier.destroy();
    return { ok: true };
  }
}

module.exports = DossierService;
