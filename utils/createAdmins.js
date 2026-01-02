const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const adminsToCreate = [
      {
        name: 'Recipe Admin',
        email: 'admin@recipeapp.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        name: 'Jace Admin',
        email: 'jacegeeks@gmail.com',
        password: '00tolerance',
        role: 'admin'
      }
    ];

    for (const adminData of adminsToCreate) {
      // Check if admin already exists
      const adminExists = await User.findOne({ email: adminData.email });
      
      if (adminExists) {
        console.log(`⚠️  Admin user already exists: ${adminData.email}`);
        console.log(`   Role: ${adminExists.role}`);
        continue;
      }

      // Create admin user
      const admin = new User(adminData);
      await admin.save();
      
      console.log(`✅ Admin user created successfully!`);
      console.log(`   📧 Email: ${adminData.email}`);
      console.log(`   🔑 Password: ${adminData.password}`);
      console.log('');
    }

    console.log('⚠️  SECURITY: Login and change passwords immediately!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmins();