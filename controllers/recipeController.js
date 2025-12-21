const Recipe = require('../models/Recipe');
const User = require('../models/User');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const search = req.query.search;
    
    let query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search };
    
    const recipes = await Recipe.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      recipes,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('reviews.user', 'name avatar');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Private/Admin
const createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      author: req.user.id
    });
    
    const createdRecipe = await recipe.save();
    res.status(201).json(createdRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    Object.keys(req.body).forEach(key => {
      recipe[key] = req.body[key];
    });
    
    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    await recipe.deleteOne();
    res.json({ message: 'Recipe removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a recipe
// @route   POST /api/recipes/:id/like
// @access  Private
const likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if already liked
    const alreadyLiked = recipe.likes.some(
      like => like.toString() === req.user.id.toString()
    );
    
    if (alreadyLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(
        like => like.toString() !== req.user.id.toString()
      );
    } else {
      // Like
      recipe.likes.push(req.user.id);
    }
    
    await recipe.save();
    res.json({ 
      likes: recipe.likes,
      liked: !alreadyLiked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Star a recipe (add to favorites)
// @route   POST /api/recipes/:id/star
// @access  Private
const starRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if already starred
    const alreadyStarred = recipe.stars.some(
      star => star.toString() === req.user.id.toString()
    );
    
    if (alreadyStarred) {
      // Unstar
      recipe.stars = recipe.stars.filter(
        star => star.toString() !== req.user.id.toString()
      );
      user.starredRecipes = user.starredRecipes.filter(
        id => id.toString() !== recipe._id.toString()
      );
    } else {
      // Star
      recipe.stars.push(req.user.id);
      user.starredRecipes.push(recipe._id);
    }
    
    await recipe.save();
    await user.save();
    
    res.json({ 
      stars: recipe.stars,
      starred: !alreadyStarred 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to recipe
// @route   POST /api/recipes/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const { rating, comment } = req.body;
    
    // Check if user already reviewed
    const alreadyReviewed = recipe.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }
    
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };
    
    recipe.reviews.push(review);
    recipe.averageRating = 
      recipe.reviews.reduce((acc, item) => item.rating + acc, 0) / recipe.reviews.length;
    
    await recipe.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recipe reviews
// @route   GET /api/recipes/:id/reviews
// @access  Public
const getRecipeReviews = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .select('reviews')
      .populate('reviews.user', 'name avatar');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  starRecipe,
  addReview,
  getRecipeReviews
};