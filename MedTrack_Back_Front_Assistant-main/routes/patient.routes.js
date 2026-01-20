// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');

router.post('/', PatientController.create);
router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.put('/:id', PatientController.update);
router.delete('/:id', PatientController.delete);
router.get('/:id/rendezvous', PatientController.getRendezVous);
router.get('/:id/dossier-complet', PatientController.getDossierComplet);
router.get('/:id/dossier-medical/pdf', PatientController.downloadDossierPdf);



module.exports = router;
