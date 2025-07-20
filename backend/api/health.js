const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Check database connection
  let dbStatus = 'disconnected';
  try {
    if (!mongoose.connection.readyState) {
      // Try to connect if not connected
      if (process.env.MONGODB_URI) {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      }
    }
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus = 'error';
  }
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: dbStatus,
    cors: 'enabled'
  });
};
