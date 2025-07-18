const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// Clerk authentication middleware
const requireAuth = ClerkExpressWithAuth({
  // This will add the user object to req.auth
  onError: (error) => {
    console.error('Clerk auth error:', error);
    return error;
  }
});

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.auth.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  next();
};

// Middleware to extract user ID from Clerk auth
const extractUserId = (req, res, next) => {
  if (req.auth && req.auth.userId) {
    req.userId = req.auth.userId;
  }
  next();
};

// Optional authentication - doesn't require auth but extracts user if present
const optionalAuth = (req, res, next) => {
  if (req.auth && req.auth.userId) {
    req.userId = req.auth.userId;
  }
  next();
};

module.exports = {
  requireAuth,
  checkAuth,
  extractUserId,
  optionalAuth
};
