// controllers/patientController.js
const PatientService = require('../services/patientService');

const PDFDocument = require('pdfkit');
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
  static async getRendezVous(req, res) {
  try {
    const rdvs = await PatientService.getPatientRendezVous(req.params.id);
    return res.json(rdvs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur récupération rendez-vous du patient' });
  }
}
static async getDossierComplet(req, res) {
  try {
    const result = await PatientService.getDossierComplet(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Patient ou dossier médical introuvable' });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur récupération dossier complet du patient' });
  }
}
static async downloadDossierPdf(req, res) {
  try {
    const data = await PatientService.getDossierComplet(req.params.id);
    if (!data) return res.status(404).json({ message: "Dossier introuvable" });

    const { patient, dossierMedical, consultations } = data;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="dossier_patient_${req.params.id}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('MedTrack - Dossier Médical', { align: 'center' });
    doc.moveDown();
const nomComplet = `${patient.utilisateur.nom} ${patient.utilisateur.prenom}`;
    doc.fontSize(12).text(`Nom Complet : ${nomComplet}`);
    doc.text(`Dossier: ${dossierMedical.numero_dossier}`);
    doc.text(`Maladie: ${dossierMedical.maladie || '-'}`);
    doc.text(`BMI: ${dossierMedical.bmi || '-'}`);
    doc.text(`Pression: ${dossierMedical.pression_sanguine || '-'}`);
    doc.text(`Glucose: ${dossierMedical.taux_glucose || '-'}`);
    doc.moveDown();

    doc.fontSize(14).text('Consultations', { underline: true });
    doc.moveDown(0.5);

    if (!consultations.length) {
      doc.fontSize(12).text('Aucune consultation.');
    } else {
      consultations.forEach((c, idx) => {
        doc.fontSize(12).text(`${idx + 1}. Date: ${c.date_cons}`);
        doc.text(`   Compte rendu: ${c.compte_rendu || '-'}`);
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur génération PDF" });
  }
}
}

module.exports = PatientController;
