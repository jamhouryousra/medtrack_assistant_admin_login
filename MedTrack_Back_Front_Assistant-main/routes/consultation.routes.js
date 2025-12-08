// routes/consultation.routes.js
const express = require('express');
const router = express.Router();
const ConsultationController = require('../controllers/consultationController');

router.post('/', ConsultationController.create);
router.get('/', ConsultationController.getAll);
router.get('/:id', ConsultationController.getById);
router.put('/:id', ConsultationController.update);
router.delete('/:id', ConsultationController.delete);

module.exports = router;
