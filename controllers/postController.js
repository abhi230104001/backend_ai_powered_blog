const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username profileImage').sort('-createdAt');
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profileImage')
      .populate('comments.user', 'username profileImage');

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    // If image uploaded via multer/cloudinary, it will be in req.file.path
    const imageUrl = req.file ? req.file.path : req.body.image || '';
    
    // tags could be stringified JSON array
    let parsedTags = [];
    if (req.body.tags) {
        try { parsedTags = JSON.parse(req.body.tags); }
        catch(e) { parsedTags = req.body.tags.split(',').map(t => t.trim()); }
    }

    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      tags: parsedTags,
      author: req.user.id,
      image: imageUrl,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    if (req.body.tags) {
      try { updateData.tags = JSON.parse(req.body.tags); }
      catch(e) { updateData.tags = req.body.tags.split(',').map(t => t.trim()); }
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized' });
    }

    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
