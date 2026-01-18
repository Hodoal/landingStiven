require('dotenv').config();
const mongoose = require('mongoose');

// Global connection management
let cachedConnection = null;

async function getMongoConnection() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';
    console.log('Connecting to MongoDB...');
    
    const connection = await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      serverSelectionTimeoutMS: 20000,
      bufferTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      family: 4
    });
    
    cachedConnection = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = { getMongoConnection };
