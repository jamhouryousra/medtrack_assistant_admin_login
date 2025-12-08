// routes/assistant.routes.js
const express = require('express');
const router = express.Router();
const AssistantController = require('../controllers/assistantController');

router.post('/', AssistantController.create);
router.get('/', AssistantController.getAll);
router.get('/:id', AssistantController.getById);
router.put('/:id', AssistantController.update);
router.delete('/:id', AssistantController.delete);

module.exports = router;
