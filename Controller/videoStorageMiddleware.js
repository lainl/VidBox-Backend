const multer = require('multer');
const { ObjectId } = require('mongodb');
const { 
  uploadVideoToDrive, 
  removeFileFromDrive 
} = require('./googleCloudVideoStoring');
const {
  addVideo,
  updateVideoTitleById,
  deleteVideoById,
  findVideoById
} = require('./mongoDB');

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

const uploadVideo = (req, res) => {
  upload.single('video')(req, res, async (err) => {
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

    const { userId, title } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request body.' });
    }

    try {
      const driveResponse = await uploadVideoToDrive(req.file);
      if (!driveResponse || !driveResponse.id) {
        return res.status(500).json({ error: 'Upload to Google Drive failed' });
      }

      const videoTitle = title || req.file.originalname;

      const videoDoc = await addVideo(req.file, {
        videoID: driveResponse.id,
        title: videoTitle,
        googleDriveLink: driveResponse.webViewLink,
        postTime: new Date(),
        userID: userId
      });

      return res.json({
        message: 'Video uploaded and added to DB successfully',
        videoRecord: {
          _id: videoDoc._id,
          title: videoDoc.title,
          googleDriveLink: videoDoc.googleDriveLink
        }
      });
    } catch (uploadError) {
      return res.status(500).json({
        error: 'Failed to upload and add video',
        details: uploadError.message
      });
    }
  });
};


const videoUpdateTitle = async (req, res) => {
  try {
    const { videoid } = req.params;
    const { title } = req.body;
    
    if (!videoid || !title) {
      return res.status(400).json({ error: 'videoid and title are required' });
    }
    
    const updatedVideo = await updateVideoTitleById(videoid, title);
    
    return res.json({
      message: 'Video title updated successfully',
      updatedVideo
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update video title',
      details: error.message
    });
  }
};

const videoDelete = async (req, res) => {
  try {
    const { videoId, userId, driveLink } = req.body;
    if (!videoId || !userId) {
      return res.status(400).json({ error: 'videoId and userId are required' });
    }

    if (driveLink) {
      try {
        await removeFileFromDrive(driveLink);
      } catch (driveErr) {
        console.error('Error removing file from Google Drive:', driveErr.message);
      }
    }

    const result = await deleteVideoById(videoId, userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete video',
      details: error.message
    });
  }
};


const videoFindById = async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const videoDoc = await findVideoById(videoId);
    if (!videoDoc) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json(videoDoc);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to retrieve video',
      details: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  videoUpdateTitle,
  videoDelete,
  videoFindById
};
