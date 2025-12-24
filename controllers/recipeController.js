const Recipe = require('../models/Recipe');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// ✅ Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Define the upload middleware
const uploadRecipeImage = upload.single('image');

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
    console.log('📥 Received body:', req.body);
    console.log('📥 Received file:', req.file);

    // ✅ Parse JSON strings back to arrays (from FormData)
    let ingredients = req.body.ingredients;
    let instructions = req.body.instructions;
    let tags = req.body.tags;

    if (typeof ingredients === 'string') {
      ingredients = JSON.parse(ingredients);
    }
    if (typeof instructions === 'string') {
      instructions = JSON.parse(instructions);
    }
    if (typeof tags === 'string') {
      tags = JSON.parse(tags);
    }

    // ✅ Convert string numbers to actual numbers
    const prepTime = parseInt(req.body.prepTime);
    const cookTime = parseInt(req.body.cookTime);
    const servings = parseInt(req.body.servings);

    // Validate required fields
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ 
        message: 'Please provide title and description' 
      });
    }

    if (isNaN(prepTime) || isNaN(cookTime) || isNaN(servings)) {
      return res.status(400).json({ 
        message: 'prepTime, cookTime, and servings must be valid numbers' 
      });
    }

    // Build recipe data
    const recipeData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category,
      difficulty: req.body.difficulty,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions,
      tags,
      author: req.user.id
    };

    // Add image path if uploaded
    if (req.file) {
      recipeData.image = `/uploads/${req.file.filename}`;
    }

    console.log('✅ Final recipe data:', recipeData);

    const recipe = new Recipe(recipeData);
    const createdRecipe = await recipe.save();
    
    res.status(201).json(createdRecipe);
  } catch (error) {
    console.error('❌ Error creating recipe:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = async (req, res) => {
  try {
    console.log('📥 Update - Received body:', req.body);
    console.log('📥 Update - Received file:', req.file);

    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Parse JSON strings if they exist (from FormData)
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }
    if (req.body.instructions && typeof req.body.instructions === 'string') {
      req.body.instructions = JSON.parse(req.body.instructions);
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    // Convert numbers
    if (req.body.prepTime) req.body.prepTime = parseInt(req.body.prepTime);
    if (req.body.cookTime) req.body.cookTime = parseInt(req.body.cookTime);
    if (req.body.servings) req.body.servings = parseInt(req.body.servings);

    // Update image if new file uploaded
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    Object.keys(req.body).forEach(key => {
      recipe[key] = req.body[key];
    });
    
    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (error) {
    console.error('❌ Error updating recipe:', error);
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
    
    const alreadyLiked = recipe.likes.some(
      like => like.toString() === req.user.id.toString()
    );
    
    if (alreadyLiked) {
      recipe.likes = recipe.likes.filter(
        like => like.toString() !== req.user.id.toString()
      );
    } else {
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
    
    const alreadyStarred = recipe.stars.some(
      star => star.toString() === req.user.id.toString()
    );
    
    if (alreadyStarred) {
      recipe.stars = recipe.stars.filter(
        star => star.toString() !== req.user.id.toString()
      );
      user.starredRecipes = user.starredRecipes.filter(
        id => id.toString() !== recipe._id.toString()
      );
    } else {
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
  getRecipeReviews,
  uploadRecipeImage // Export the multer middleware
};