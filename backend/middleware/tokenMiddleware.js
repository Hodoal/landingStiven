const { tokenManager } = require('../services/tokenManager');

/**
 * Middleware para verificar y renovar tokens automáticamente antes de operaciones de calendario
 * Este middleware se puede usar en rutas que requieren acceso a Google Calendar
 */
const ensureValidToken = async (req, res, next) => {
  try {
    console.log('\n🔐 Token validation middleware: Checking token validity...');
    
    // Verificar si Google Calendar está configurado
    const hasBasicConfig = 
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN;

    if (!hasBasicConfig) {
      console.log('⚠️ Google Calendar not configured, allowing request to proceed with mock data');
      req.calendarAvailable = false;
      return next();
    }

    // Intentar obtener un cliente validado
    const validatedClient = await tokenManager.getValidatedClient();
    
    if (validatedClient) {
      console.log('✅ Token validation successful');
      req.calendarAvailable = true;
      req.oauth2Client = validatedClient;
    } else {
      console.log('❌ Could not obtain valid token, calendar operations will use mock data');
      req.calendarAvailable = false;
    }

    next();
  } catch (error) {
    console.error('❌ Error in token validation middleware:', error.message);
    // No fallar la request, solo marcar calendar como no disponible
    req.calendarAvailable = false;
    next();
  }
};

/**
 * Middleware específico para rutas críticas donde el calendar DEBE funcionar
 */
const requireValidToken = async (req, res, next) => {
  try {
    console.log('\n🔐 Strict token validation: Ensuring calendar access...');
    
    const validatedClient = await tokenManager.getValidatedClient();
    
    if (!validatedClient) {
      return res.status(503).json({
        success: false,
        error: 'CALENDAR_UNAVAILABLE',
        message: 'Google Calendar service is temporarily unavailable. Please check your token configuration.',
        details: tokenManager.getTokenStatus()
      });
    }

    console.log('✅ Strict token validation successful');
    req.oauth2Client = validatedClient;
    next();
  } catch (error) {
    console.error('❌ Error in strict token validation:', error.message);
    res.status(500).json({
      success: false,
      error: 'TOKEN_VALIDATION_ERROR',
      message: 'Could not validate Google Calendar access',
      details: error.message
    });
  }
};

/**
 * Middleware de logging para operaciones de calendario
 */
const logCalendarOperation = (operationType) => {
  return (req, res, next) => {
    console.log(`\n📅 Calendar Operation: ${operationType}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`   User-Agent: ${req.get('User-Agent')}`);
    
    // Log token status
    const tokenStatus = tokenManager.getTokenStatus();
    console.log(`   Token Valid: ${tokenStatus.isValid}`);
    console.log(`   Token Expires: ${tokenStatus.expiryDateLocal || 'Unknown'}`);
    
    next();
  };
};

/**
 * Handler de errores específico para errores de calendario
 */
const handleCalendarErrors = (err, req, res, next) => {
  console.error('\n❌ Calendar Error Handler:', err.message);
  
  // Si es un error de autenticación, proporcionar información útil
  if (err.message.includes('token') || err.message.includes('auth') || err.message.includes('credential')) {
    const tokenStatus = tokenManager.getTokenStatus();
    
    return res.status(401).json({
      success: false,
      error: 'CALENDAR_AUTH_ERROR',
      message: 'Google Calendar authentication failed',
      details: {
        originalError: err.message,
        tokenStatus: tokenStatus,
        suggestions: [
          'Check if your Google OAuth credentials are valid',
          'Verify that the refresh token is not expired',
          'Try re-authorizing the application with Google',
          'Check Google Cloud Console for API quotas and restrictions'
        ]
      }
    });
  }

  // Para otros errores, pasar al siguiente handler
  next(err);
};

module.exports = {
  ensureValidToken,
  requireValidToken,
  logCalendarOperation,
  handleCalendarErrors
};