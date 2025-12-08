// routes/prediction.routes.js
const express = require('express');
const router = express.Router();
const PredictionController = require('../controllers/predictionController');

router.post('/', PredictionController.create);
router.get('/', PredictionController.getAll);
router.get('/:id', PredictionController.getById);
router.put('/:id', PredictionController.update);
router.delete('/:id', PredictionController.delete);

module.exports = router;
