const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    console.log('🚀 Test d\'upload de vidéo...');
    
    // Créez un faux fichier vidéo pour test
    const testFilePath = path.join(__dirname, 'test-video.mp4');
    
    // Créez un fichier test simple (quelques bytes)
    fs.writeFileSync(testFilePath, 'fake video content for testing');
    
    // Créez FormData
    const form = new FormData();
    form.append('videoFile', fs.createReadStream(testFilePath), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    
    // Envoyez la requête
    const response = await axios.post('http://localhost:5000/api/test-upload', form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    console.log('✅ Upload réussi:', response.data);
    
    // Supprimez le fichier test
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

async function testEmail() {
  try {
    console.log('\n📧 Test de configuration email...');
    
    const response = await axios.post('http://localhost:5000/api/test-email');
    console.log('✅ Email configuré:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur email:', error.response?.data || error.message);
  }
}

// Exécutez les tests
async function runTests() {
  await testUpload();
  await testEmail();
}

// Installez axios si pas déjà installé
console.log('Installation d\'axios si nécessaire...');
const { execSync } = require('child_process');
try {
  require('axios');
  console.log('axios déjà installé');
} catch {
  execSync('npm install axios', { stdio: 'inherit' });
}

runTests();