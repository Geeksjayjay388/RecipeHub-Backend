const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getUserMessages,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, sendMessage);
router.get('/my-messages', protect, getUserMessages);

// Admin routes
router.get('/', protect, admin, getAllMessages);
router.get('/:id', protect, admin, getMessageById);
router.put('/:id/status', protect, admin, updateMessageStatus);
router.post('/:id/reply', protect, admin, replyToMessage);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;