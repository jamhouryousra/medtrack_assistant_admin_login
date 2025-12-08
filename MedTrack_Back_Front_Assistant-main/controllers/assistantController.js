// controllers/assistantController.js
const AssistantService = require('../services/assistantService');

class AssistantController {
  static async create(req, res) {
    try {
      const result = await AssistantService.createAssistant(req.body);
      return res.status(201).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur création assistant' });
    }
  }

  static async getAll(req, res) {
    try {
      const assistants = await AssistantService.getAllAssistants();
      return res.json(assistants);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération assistants' });
    }
  }

  static async getById(req, res) {
    try {
      const assistant = await AssistantService.getAssistantById(req.params.id);
      if (!assistant) {
        return res.status(404).json({ message: 'Assistant introuvable' });
      }
      return res.json(assistant);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur récupération assistant' });
    }
  }

  static async update(req, res) {
    try {
      const result = await AssistantService.updateAssistant(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ message: 'Assistant introuvable' });
      }
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur mise à jour assistant' });
    }
  }

  static async delete(req, res) {
    try {
      const ok = await AssistantService.deleteAssistant(req.params.id);
      if (!ok) {
        return res.status(404).json({ message: 'Assistant introuvable' });
      }
      return res.json({ message: 'Assistant supprimé' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur suppression assistant' });
    }
  }
}

module.exports = AssistantController;
