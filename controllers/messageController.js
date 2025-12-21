const Message = require('../models/Message');

// @desc    Send message to admin
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { type, title, content, recipeId, image } = req.body;
    
    const message = new Message({
      user: req.user.id,
      type: type || 'suggestion',
      title: title || 'No title',
      content: content || 'No content',
      recipe: recipeId,
      image: image,
      status: 'pending'
    });
    
    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's messages
// @route   GET /api/messages/my-messages
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages (Admin only)
// @route   GET /api/messages
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private/Admin
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update message status
// @route   PUT /api/messages/:id/status
// @access  Private/Admin
const updateMessageStatus = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.status = req.body.status || message.status;
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to message
// @route   POST /api/messages/:id/reply
// @access  Private/Admin
const replyToMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.adminReply = {
      content: req.body.content,
      repliedAt: new Date()
    };
    message.status = 'replied';
    
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  sendMessage,
  getUserMessages,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage
};