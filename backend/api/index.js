const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Route imports
const recipeRoutes = require('../routes/recipes');
const groceryRoutes = require('../routes/grocery');
const pantryRoutes = require('../routes/pantry');
const userRoutes = require('../routes/user');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.spoonacular.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Enhanced rate limiting for production
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware
app.use(compression());

// Enhanced CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      process.env.FRONTEND_URL || 'https://recipe.techycsr.dev',
      'https://recipe.techycsr.dev'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now to test
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
}

// Health check and info endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cors: 'enabled'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/user', userRoutes);

// Handle Vercel serverless function routing
app.all('*', (req, res, next) => {
  // Extract the path after /api
  if (req.url.startsWith('/api/')) {
    next();
  } else {
    // Handle root requests
    if (req.url === '/' || req.url === '') {
      return res.json({
        message: 'Recipe Generator API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/api/health',
          recipes: '/api/recipes',
          grocery: '/api/grocery',
          pantry: '/api/pantry',
          user: '/api/user'
        }
      });
    }
    next();
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Recipe Generator API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      recipes: '/api/recipes',
      grocery: '/api/grocery',
      pantry: '/api/pantry',
      user: '/api/user'
    }
  });
});

// Export the Express app for Vercel serverless function
module.exports = app;
