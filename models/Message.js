const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['suggestion', 'feedback', 'review', 'question'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  image: String,
  status: {
    type: String,
    enum: ['pending', 'read', 'replied', 'archived'],
    default: 'pending'
  },
  adminReply: {
    content: String,
    repliedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);