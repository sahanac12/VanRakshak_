const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Upload image
 * @route   POST /api/upload/image
 * @access  Private
 */
router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  const url = `/uploads/images/${req.file.filename}`;
  res.status(200).json({
    success: true,
    url: url
  });
});

/**
 * @desc    Upload audio
 * @route   POST /api/upload/audio
 * @access  Private
 */
router.post('/audio', protect, upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an audio file' });
  }

  const url = `/uploads/audio/${req.file.filename}`;
  res.status(200).json({
    success: true,
    url: url
  });
});

module.exports = router;
