require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { autoTokenRefresh } = require('../backend/services/autoTokenRefresh');

const app = express();

// Desabilitar buffer de Mongoose para evitar timeouts
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection with proper error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 25,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      waitQueueTimeoutMS: 30000
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Wait a bit for pool to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Lazy-load routes - importar DESPUÉS de la conexión
const loadRoutes = () => {
  try {
    console.log('📂 Loading routes...');
    console.log('   Mongoose readyState:', mongoose.connection.readyState, '(should be 1)');
    console.log('   Mongoose db:', !!mongoose.connection.db);
    
    const bookingRoutes = require('../backend/routes/bookingRoutes');
    const calendarRoutes = require('../backend/routes/calendarRoutes');
    const leadsRoutes = require('../backend/routes/leadsRoutes');
    const consultantRoutes = require('../backend/routes/consultantRoutes');
    
    console.log('✅ Routes loaded');
    console.log('   Mongoose readyState after require:', mongoose.connection.readyState);
    
    // Registrar rutas del backend
    app.use('/api/booking', ensureMongodbConnected, bookingRoutes);
    app.use('/api/calendar', ensureMongodbConnected, calendarRoutes);
    app.use('/api/leads', ensureMongodbConnected, leadsRoutes);
    app.use('/api/consultants', ensureMongodbConnected, consultantRoutes);
    console.log('✅ Routes registered successfully');

    // Iniciar servicio de renovación automática de tokens
    autoTokenRefresh.start();
  } catch (err) {
    console.error('❌ Error loading routes:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

// Middleware to ensure MongoDB is connected
const ensureMongodbConnected = (req, res, next) => {
  const readyState = mongoose.connection.readyState;
  console.log(`[MIDDLEWARE] MongoDB readyState: ${readyState}`);
  if (readyState !== 1) {
    console.warn(`⚠️  [MIDDLEWARE] MongoDB not ready (state: ${readyState})`);
    return res.status(503).json({ error: 'Database not ready' });
  }
  console.log(`✅ [MIDDLEWARE] MongoDB ready, calling next()`);
  next();
};

// Health check endpoints (BEFORE routes)
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', environment: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ test: 'ok', node_env: process.env.NODE_ENV });
});

// Function to setup 404 and error handlers (called AFTER routes are loaded)
const setupErrorHandlers = () => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
};

// Server startup
const PORT = process.env.PORT || 3001;

// Only start server if not in a serverless environment
if (require.main === module) {
  connectDatabase().then((connected) => {
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }
    
    // Load routes AFTER MongoDB is connected
    loadRoutes();
    
    // TEST: Try a direct insert to MongoDB
    const Lead = require('../backend/models/Lead');
    const testLead = new Lead({
      full_name: 'Test Lead at Startup',
      email: 'test.startup@example.com',
      phone: '1234567890',
      is_labor_lawyer: true,
      monthly_consultations: '10–30'
    });
    
    testLead.save().then(saved => {
      console.log('✅ TEST INSERT SUCCESSFUL:', saved._id);
    }).catch(err => {
      console.error('❌ TEST INSERT FAILED:', err.message);
    });
    
    // Verify MongoDB connection is active
    mongoose.connection.db.admin().ping((err, result) => {
      if (err) {
        console.error('❌ MongoDB ping failed:', err.message);
      } else {
        console.log('✅ MongoDB ping successful:', result.ok === 1 ? 'connected' : 'disconnected');
      }
    });
    
    // Setup error handlers AFTER routes are loaded
    setupErrorHandlers();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`MongoDB: ${MONGODB_URI}`);
    });
  });
}

module.exports = app;
