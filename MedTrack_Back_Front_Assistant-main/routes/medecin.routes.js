// routes/medecin.routes.js
const express = require('express');
const router = express.Router();
const MedecinController = require('../controllers/medecinController');

router.post('/', MedecinController.create);
router.get('/', MedecinController.getAll);
router.get('/:id', MedecinController.getById);
router.put('/:id', MedecinController.update);
router.delete('/:id', MedecinController.delete);

module.exports = router;
