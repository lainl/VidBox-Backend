const multer = require('multer');

const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      req.fileValidationError = 'Only video files are allowed!';
      return cb(null, false);
    }
    cb(null, true);
  }
});

const vidoeStorageMiddleware = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ error: err.message || 'An unexpected error occurred' });
    }
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    res.json({
      filename: req.file.originalname,
      title: req.file.originalname,
      mimetype: req.file.mimetype
    });
  });
};

module.exports = vidoeStorageMiddleware;
