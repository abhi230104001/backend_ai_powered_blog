const express = require('express');
const { generatePost } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const localUpload = require('../utils/localUpload');

const router = express.Router();

router.post('/generate', protect, localUpload.single('image'), generatePost);

module.exports = router;
