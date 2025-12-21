const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserStarredRecipes,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/starred', protect, getUserStarredRecipes);

// Admin routes for user management
router.get('/', protect, admin, getAllUsers);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;  