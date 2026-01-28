const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
dotenv.config();

// Importer les routes
const formRoutes = require('./src/routes/formRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware CORS (autoriser votre frontend)
const allowedOrigins = [
  'https://uber-eats-assistance-frontend-jqms.vercel.app', // VOTRE URL VERCEL
  'http://localhost:5173'  // Pour développement
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (comme les apps mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `L'origine ${origin} n'est pas autorisée par CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware pour parser JSON et limiter la taille
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Servir les fichiers uploads (temporaire, pour développement)
app.use('/uploads', express.static(uploadsDir));

// Routes API
app.use('/api/form', formRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'API Uber Eats Assistance',
    version: '1.0.0',
    endpoints: {
      submit: 'POST /api/form/submit',
      health: 'GET /api/form/health',
      uploads: 'GET /uploads/:filename'
    }
  });
});

// Route de test simple (à garder pour vérification)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend Uber Eats Assistance fonctionnel!',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    availableRoutes: ['/api/form/submit', '/api/form/health', '/']
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('🔥 Erreur serveur:', err);
  
  // Erreur CORS
  if (err.name === 'CorsError') {
    return res.status(403).json({
      error: 'Accès interdit par CORS',
      details: err.message
    });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue sur le serveur' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
  console.log(`📁 Dossier uploads: ${uploadsDir}`);
  console.log(`🌐 CORS autorisé pour: ${allowedOrigins.join(', ')}`);
  console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
});