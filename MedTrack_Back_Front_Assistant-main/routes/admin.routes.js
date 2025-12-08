// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

router.post('/', AdminController.create);
router.get('/', AdminController.getAll);
router.get('/:id', AdminController.getById);
router.put('/:id', AdminController.update);
router.delete('/:id', AdminController.delete);

module.exports = router;
