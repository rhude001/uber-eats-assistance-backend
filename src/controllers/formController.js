const { generatePDF } = require('../services/pdfService');
const emailService = require('../services/emailService');
const fs = require('fs');
const path = require('path');

/**
 * Contrôleur pour soumettre le formulaire
 */
const submitForm = async (req, res) => {
  try {
    console.log('📝 Nouvelle soumission de formulaire reçue');
    
    // Récupérer les données du formulaire
    const { 
      fullName, 
      uberId, 
      uberEmail, 
      city, 
      transcashCode,
      situation 
    } = req.body;
    
    // Vérifier les données requises
    if (!fullName || !uberId || !uberEmail || !city || !transcashCode || !situation) {
      return res.status(400).json({
        error: 'Tous les champs sont requis'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'La vidéo de vérification est requise'
      });
    }
    
    // Préparer les données pour le PDF
    const formData = {
      fullName,
      uberId,
      uberEmail,
      city,
      transcashCode
    };
    
    console.log('📊 Génération du PDF...');
    
    // Générer le PDF
    const pdfResult = await generatePDF(formData, situation);
    
    console.log('✅ PDF généré:', pdfResult.filename);
    
    // Chemin de la vidéo uploadée
    const videoPath = req.file.path;
    
    console.log('📧 Envoi de l\'email avec pièces jointes...');
    
    // Envoyer l'email avec PDF et vidéo
    const emailResult = await emailService.sendAssistanceRequest(
      formData,
      situation,
      pdfResult.filepath,
      videoPath
    );
    
    console.log('🎉 Demande traitée avec succès!');
    
    // Réponse de succès
    res.status(200).json({
      success: true,
      message: 'Votre demande a été envoyée avec succès',
      reference: `UE-${Date.now()}`,
      emailId: emailResult.messageId,
      timestamp: new Date().toISOString()
    });
    
    // Nettoyage automatique après 5 minutes (optionnel)
    setTimeout(() => {
      try {
        fs.unlinkSync(pdfResult.filepath);
        fs.unlinkSync(videoPath);
        console.log('🧹 Fichiers temporaires nettoyés');
      } catch (cleanupError) {
        console.warn('⚠️ Erreur lors du nettoyage:', cleanupError.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement:', error);
    
    res.status(500).json({
      error: 'Une erreur est survenue lors du traitement de votre demande',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Route de santé
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Uber Eats Assistance Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

module.exports = {
  submitForm,
  healthCheck
};