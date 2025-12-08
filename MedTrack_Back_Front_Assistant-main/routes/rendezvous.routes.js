// routes/rendezvous.routes.js
const express = require('express');
const router = express.Router();
const RendezVousController = require('../controllers/rendezvousController');

router.post('/', RendezVousController.create);
router.get('/', RendezVousController.getAll);
router.get('/:id', RendezVousController.getById);
router.put('/:id', RendezVousController.update);
router.delete('/:id', RendezVousController.delete);

module.exports = router;
