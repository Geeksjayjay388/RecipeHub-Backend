const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  starRecipe,
  addReview,
  getRecipeReviews
} = require('../controllers/recipeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.get('/:id/reviews', getRecipeReviews);

// Protected routes
router.post('/:id/like', protect, likeRecipe);
router.post('/:id/star', protect, starRecipe);
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.post('/', protect, admin, createRecipe);
router.put('/:id', protect, admin, updateRecipe);
router.delete('/:id', protect, admin, deleteRecipe);

module.exports = router;