const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

module.exports = router;
