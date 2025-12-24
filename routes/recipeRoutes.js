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
  getRecipeReviews,
  uploadRecipeImage  // ✅ Import the multer middleware
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

// Admin routes - ✅ Add uploadRecipeImage middleware BEFORE createRecipe
router.post('/', protect, admin, uploadRecipeImage, createRecipe);
router.put('/:id', protect, admin, uploadRecipeImage, updateRecipe);
router.delete('/:id', protect, admin, deleteRecipe);

module.exports = router;