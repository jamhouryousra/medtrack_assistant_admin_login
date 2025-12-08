// routes/dossier.routes.js
const express = require('express');
const router = express.Router();
const DossierController = require('../controllers/dossierController');

router.post('/', DossierController.create);
router.get('/', DossierController.getAll);
router.get('/:id', DossierController.getById);
router.put('/:id', DossierController.update);
router.delete('/:id', DossierController.delete);

module.exports = router;
