const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un PDF avec les informations du formulaire
 */
const generatePDF = (formData, situation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Nom du fichier PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `demande-${formData.fullName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      
      // Créer un stream pour écrire le fichier
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      // === EN-TÊTE ===
      // Logo Uber Eats (texte)
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Uber Eats', 50, 50);
      
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#06C167')
         .text('Assistance', 140, 50);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Demande d\'assistance technique', 50, 80);
      
      // Ligne de séparation
      doc.moveTo(50, 100)
         .lineTo(550, 100)
         .strokeColor('#06C167')
         .lineWidth(2)
         .stroke();
      
      // === TITRE ===
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('INFORMATIONS DU CLIENT', 50, 120);
      
      // === INFORMATIONS ===
      let yPosition = 160;
      
      // Situation
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Situation:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(situation === 'waiting' ? 'Compte en liste d\'attente' : 'Compte bloqué', 150, yPosition);
      
      yPosition += 30;
      
      // 1. Nom complet
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Nom complet:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(formData.fullName, 150, yPosition);
      
      yPosition += 25;
      
      // 2. Numéro de compte
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Numéro de compte:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(formData.uberId, 150, yPosition);
      
      yPosition += 25;
      
      // 3. Email
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Email du compte:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(formData.uberEmail, 150, yPosition);
      
      yPosition += 25;
      
      // 4. Ville
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Ville d\'opération:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(formData.city, 150, yPosition);
      
      yPosition += 25;
      
      // 5. Code Transcash
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Code Transcash:', 50, yPosition);
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#06C167')
         .text(formData.transcashCode, 150, yPosition);
      
      yPosition += 40;
      
      // === INFORMATIONS DE TRAITEMENT ===
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('INFORMATIONS DE TRAITEMENT', 50, yPosition);
      
      yPosition += 30;
      
      // Date et heure
      const now = new Date();
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Date de soumission: ${now.toLocaleDateString('fr-FR')}`, 50, yPosition);
      
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Heure: ${now.toLocaleTimeString('fr-FR')}`, 50, yPosition + 20);
      
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Référence: UE-${timestamp.split('-').join('').substring(0, 12)}`, 50, yPosition + 40);
      
      // === PIED DE PAGE ===
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor('#999999')
         .text('Ce document a été généré automatiquement par le système d\'assistance Uber Eats.', 
               50, 750);
      
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor('#999999')
         .text(`ID: ${Date.now()}`, 50, 770);
      
      // Finaliser le PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve({
          filename: filename,
          filepath: filepath
        });
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDF
};