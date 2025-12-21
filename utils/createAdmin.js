const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@recipeapp.com' });
    
    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      console.log(`Email: ${adminExists.email}`);
      console.log(`Role: ${adminExists.role}`);
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Recipe Admin',
      email: 'admin@recipeapp.com',
      password: 'Admin123!', // You'll change this after first login
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@recipeapp.com');
    console.log('🔑 Password: Admin123!');
    console.log('\n⚠️  SECURITY: Login and change password immediately!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();