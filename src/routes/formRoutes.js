const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { uploadVideo, handleUploadError } = require('../middleware/uploadMiddleware');

/**
 * @route   POST /api/form/submit
 * @desc    Soumettre le formulaire d'assistance
 * @access  Public
 */
router.post('/submit', 
  uploadVideo,
  handleUploadError,
  formController.submitForm
);

/**
 * @route   GET /api/form/health
 * @desc    Vérifier l'état du service
 * @access  Public
 */
router.get('/health', formController.healthCheck);

module.exports = router;