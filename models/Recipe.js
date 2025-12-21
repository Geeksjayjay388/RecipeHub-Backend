const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    step: Number,
    text: String
  }],
  prepTime: {
    type: Number, // in minutes
    required: true
  },
  cookTime: {
    type: Number, // in minutes
    required: true
  },
  servings: {
    type: Number,
    default: 4
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegetarian', 'Vegan', 'Quick'],
    default: 'Dinner'
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/your-cloud/image/upload/v123/recipe-placeholder.jpg'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for search
recipeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);