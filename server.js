const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ========== FIXED CORS CONFIGURATION ==========
// Remove trailing slash from CLIENT_URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5183';
const cleanClientUrl = clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl;

console.log('🌐 CORS configured for:', cleanClientUrl);

// CORS middleware - FIXED
app.use(cors({
  origin: cleanClientUrl,  // No trailing slash
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// ========== REST OF MIDDLEWARE ==========
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// ========== DEBUG MIDDLEWARE ==========
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`   Content-Type: ${req.headers['content-type'] || 'No content-type'}`);
  next();
});

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ========== TEST ENDPOINTS ==========
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date(),
    origin: req.headers.origin,
    cors: 'CORS is configured'
  });
});

// Test login endpoint (no validation)
app.post('/api/auth/test', (req, res) => {
  console.log('Test login attempt:', req.body);
  res.json({
    success: true,
    token: 'test-jwt-token-12345',
    user: {
      id: '1',
      name: 'Test Admin',
      email: req.body.email || 'admin@test.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=ff6b35&color=fff'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    server: 'Recipe API',
    port: process.env.PORT || 5500,
    origin: req.headers.origin,
    cors: 'Enabled'
  });
});

// ========== ERROR HANDLING ==========
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log('\n' + '🔥'.repeat(50));
  console.log('🍳  RECIPE APP SERVER IS COOKING! 🍳');
  console.log('🔥'.repeat(50) + '\n');
  
  console.log(`📡 Server URL:  http://localhost:${PORT}`);
  console.log(`🌐 CORS Origin: ${cleanClientUrl}`);
  console.log(`🗄️  Database:    ${process.env.MONGO_URI ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`⏰ Started at:  ${new Date().toLocaleString()}`);
  
  console.log('\n🛣️  Available Routes:');
  console.log(`   🔐 Auth:     http://localhost:${PORT}/api/auth`);
  console.log(`   🧪 Test:     http://localhost:${PORT}/api/test`);
  console.log(`   🍲 Recipes:  http://localhost:${PORT}/api/recipes`);
  console.log(`   👤 Users:    http://localhost:${PORT}/api/users`);
  console.log(`   💬 Messages: http://localhost:${PORT}/api/messages`);
  console.log(`   ❤️  Health:   http://localhost:${PORT}/api/health`);
  
  console.log('\n🔧 Test Commands:');
  console.log(`   curl http://localhost:${PORT}/api/health`);
  console.log(`   curl http://localhost:${PORT}/api/test`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/auth/test -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'`);
  
  console.log('\n🚀 Ready to serve some delicious recipes!\n');
});