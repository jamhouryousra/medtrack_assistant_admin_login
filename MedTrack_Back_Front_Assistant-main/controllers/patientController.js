// controllers/patientController.js
const PatientService = require('../services/patientService');

class PatientController {
  static async create(req, res) {
    try {
      const result = await PatientService.createPatient(req.body);
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur création patient' });
    }
  }

  static async getAll(req, res) {
    try {
      const patients = await PatientService.getAllPatients();
      return res.json(patients);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération patients' });
    }
  }

  static async getById(req, res) {
    try {
      const patient = await PatientService.getPatientById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient introuvable' });
      }
      return res.json(patient);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération patient' });
    }
  }

  static async update(req, res) {
    try {
      const result = await PatientService.updatePatient(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ message: 'Patient introuvable' });
      }
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur mise à jour patient' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await PatientService.deletePatient(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Patient introuvable' });
      }
      return res.json({ message: 'Patient supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur suppression patient' });
    }
  }
}

module.exports = PatientController;
