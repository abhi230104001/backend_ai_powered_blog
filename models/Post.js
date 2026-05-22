const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String, // Cloudinary URL
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
