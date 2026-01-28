const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  
  filename: function (req, file, cb) {
    // Nom de fichier unique: timestamp + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  // Accepter seulement les vidéos
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
    'video/webm',
    'video/mpeg'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seules les vidéos sont acceptées (MP4, MOV, AVI, WEBM)'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 1 // 1 fichier maximum
  }
});

// Middleware pour upload vidéo
const uploadVideo = upload.single('videoFile');

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'La vidéo est trop volumineuse. Taille maximum: 50MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Une seule vidéo autorisée' 
      });
    }
  } else if (err) {
    return res.status(400).json({ 
      error: err.message || 'Erreur lors de l\'upload de la vidéo' 
    });
  }
  next();
};

module.exports = {
  uploadVideo,
  handleUploadError
};