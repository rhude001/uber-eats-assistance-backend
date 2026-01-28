const { generatePDF } = require('../services/pdfService');
const emailService = require('../services/emailService');
const fs = require('fs');

const submitForm = async (req, res) => {
  try {
    const { fullName, uberId, uberEmail, city, transcashCode, situation } = req.body;
    
    if (!fullName || !uberId || !uberEmail || !city || !transcashCode || !situation) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Vidéo requise' });
    }
    
    // 1. GÉNÉRER PDF
    const formData = { fullName, uberId, uberEmail, city, transcashCode };
    const pdfResult = await generatePDF(formData, situation);
    
    // 2. ENVOYER EMAIL RESEND
    const videoPath = req.file.path;
    const emailResult = await emailService.sendAssistanceRequest(
      formData, situation, pdfResult.filepath, videoPath
    );
    
    // 3. SUCCÈS
    res.json({
      success: true,
      message: 'Demande envoyée avec succès !',
      reference: `UE-${Date.now().toString().slice(-6)}`,
      emailId: emailResult.messageId
    });
    
  } catch (error) {
    console.error('❌ ERREUR TOTALE:', error);
    res.status(500).json({ error: error.message });
  }
};

const healthCheck = (req, res) => {
  res.json({ status: 'healthy' });
};

module.exports = { submitForm, healthCheck };
