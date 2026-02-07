const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const calendarService = require('../services/calendarService');
const { tokenManager } = require('../services/tokenManager');
const { autoTokenRefresh } = require('../services/autoTokenRefresh');
const { secureGoogleCalendar } = require('../services/secureGoogleCalendar');
const { ensureValidToken, requireValidToken, logCalendarOperation } = require('../middleware/tokenMiddleware');

// Calendar service status with token information
router.get('/status', logCalendarOperation('STATUS_CHECK'), (req, res) => {
  const tokenStatus = tokenManager.getTokenStatus();
  
  res.json({ 
    status: 'Calendar service is running',
    integratedWith: 'Google Calendar',
    mode: process.env.NODE_ENV === 'development' ? 'mock' : 'production',
    tokenInfo: {
      hasRefreshToken: tokenStatus.hasRefreshToken,
      hasAccessToken: tokenStatus.hasAccessToken,
      isValid: tokenStatus.isValid,
      expiryDate: tokenStatus.expiryDateLocal,
      timeUntilExpiry: tokenStatus.timeUntilExpiry ? Math.round(tokenStatus.timeUntilExpiry / 1000 / 60) + ' minutes' : null,
      refreshInProgress: tokenStatus.refreshInProgress
    },
    isConfigured: calendarService.isGoogleCalendarConfigured()
  });
});

// Get detailed token status
router.get('/token/status', logCalendarOperation('TOKEN_STATUS'), (req, res) => {
  const tokenStatus = tokenManager.getTokenStatus();
  
  res.json({
    success: true,
    tokenStatus: {
      ...tokenStatus,
      timeUntilExpiryFormatted: tokenStatus.timeUntilExpiry ? {
        total_minutes: Math.round(tokenStatus.timeUntilExpiry / 1000 / 60),
        hours: Math.floor(tokenStatus.timeUntilExpiry / 1000 / 60 / 60),
        minutes: Math.floor((tokenStatus.timeUntilExpiry / 1000 / 60) % 60)
      } : null
    },
    isConfigured: calendarService.isGoogleCalendarConfigured()
  });
});

// Force token refresh
router.post('/token/refresh', logCalendarOperation('FORCE_REFRESH'), async (req, res) => {
  try {
    console.log('🔄 Manual token refresh requested');
    
    const success = await tokenManager.forceRefresh();
    const tokenStatus = tokenManager.getTokenStatus();
    
    if (success) {
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        tokenStatus
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        tokenStatus
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during token refresh',
      error: error.message
    });
  }
});

// Test calendar connectivity with automatic token management
router.get('/test', logCalendarOperation('CONNECTIVITY_TEST'), async (req, res) => {
  try {
    console.log('🧪 Testing calendar connectivity with automatic token management');
    
    // Test by listing today's events
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await secureGoogleCalendar.listEvents(
      today.toISOString(),
      tomorrow.toISOString()
    );
    
    res.json({
      success: true,
      message: 'Calendar connectivity test successful',
      eventsFoundToday: events.length,
      tokenStatus: tokenManager.getTokenStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Calendar connectivity test failed',
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});
router.get('/auth-url', logCalendarOperation('AUTH_URL_REQUEST'), (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ 
      success: true,
      authUrl: authUrl,
      message: 'Click the authUrl to authorize Google Calendar access'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating authentication URL',
      error: error.message 
    });
  }
});

// GET auth - Redirect to OAuth URL directly
router.get('/auth', logCalendarOperation('AUTH_REDIRECT'), async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    // Redirect directly to Google OAuth
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error during auth redirect:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during authentication',
      error: error.message 
    });
  }
});

// GET callback from Google OAuth
router.get('/auth/callback', logCalendarOperation('OAUTH_CALLBACK'), async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'No authorization code provided' 
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✓ Google OAuth successful');
    console.log('Access Token:', tokens.access_token.substring(0, 20) + '...');
    console.log('Refresh Token:', tokens.refresh_token);

    // Save refresh token to .env
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(
        /GOOGLE_REFRESH_TOKEN=.*/,
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
      );
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;

    // Initialize TokenManager with new credentials
    const { tokenManager } = require('../services/tokenManager');
    tokenManager.oauth2Client.setCredentials(tokens);
    console.log('✓ TokenManager initialized with new credentials');

    // Send success response
    res.send(`
      <html>
        <head>
          <title>Google Calendar - Autorización Exitosa</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: auto; }
            h1 { color: #4CAF50; }
            p { color: #666; }
            .code { background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ ¡Autorización Exitosa!</h1>
            <p>Google Calendar ha sido conectado correctamente.</p>
            <p>Tu aplicación ahora puede:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>Crear eventos automáticamente</li>
              <li>Ver disponibilidad</li>
              <li>Sincronizar citas</li>
            </ul>
            <p style="margin-top: 30px; color: #999;">
              Puedes cerrar esta ventana y volver a tu aplicación.
            </p>
            <p style="margin-top: 30px;">
              <a href="http://localhost:5173" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Volver a la aplicación
              </a>
            </p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error in OAuth callback:', error);
    if (error.response && error.response.data) {
      console.error('OAuth provider response:', JSON.stringify(error.response.data));
    }

    const detailedMessage = error.response?.data?.error_description || error.response?.data?.error || error.message || 'Unknown error during OAuth callback';

    res.status(500).send(`
      <html>
        <head>
          <title>Error de Autorización</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: auto; }
            h1 { color: #f44336; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✗ Error de Autorización</h1>
            <p>${detailedMessage}</p>
            <p><a href="http://localhost:5173">Volver a intentar</a></p>
          </div>
        </body>
      </html>
    `);
  }
});

// MOCK endpoint para testing - simula la creación de eventos
router.post('/create-event-mock', (req, res) => {
  try {
    const { title, description, date, time, attendeeEmail } = req.body;

    // Mock event response
    const mockEvent = {
      id: `mock-event-${Date.now()}`,
      summary: title,
      description: description,
      start: {
        dateTime: `${date}T${time}:00`,
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: `${date}T${parseInt(time) + 1}:00:00`,
        timeZone: 'America/Bogota'
      },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        entryPoints: [
          {
            entryPointType: 'video_call',
            label: 'Teams Call',
            uri: 'https://teams.microsoft.com/l/meetup-join/dummy'
          }
        ]
      }
    };

    console.log('✓ Mock Event Created:', mockEvent);

    res.json({ 
      success: true,
      message: 'Mock event created successfully (development mode)',
      event: mockEvent
    });
  } catch (error) {
    console.error('Error creating mock event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating event',
      error: error.message 
    });
  }
});

// GET available dates for a given month
// Query params: year, month (1-12)
router.get('/available-dates', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month query parameters are required'
      });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month format'
      });
    }

    const availableDates = await calendarService.getAvailableDatesByMonth(yearNum, monthNum);
    
    res.json({
      success: true,
      year: yearNum,
      month: monthNum,
      availableDates: availableDates,
      total: availableDates.length
    });
  } catch (error) {
    console.error('Error getting available dates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting available dates',
      error: error.message
    });
  }
});

// ============================================
// AUTO TOKEN REFRESH ENDPOINTS
// ============================================

// Get auto token refresh service status
router.get('/auto-refresh/status', logCalendarOperation('AUTO_REFRESH_STATUS'), (req, res) => {
  const refreshStatus = autoTokenRefresh.getStatus();
  const tokenStatus = tokenManager.getTokenStatus();
  
  res.json({
    success: true,
    autoRefreshService: {
      ...refreshStatus,
      tokenStatus
    }
  });
});

// Start auto token refresh service
router.post('/auto-refresh/start', logCalendarOperation('AUTO_REFRESH_START'), (req, res) => {
  try {
    autoTokenRefresh.start();
    res.json({
      success: true,
      message: 'Auto token refresh service started',
      status: autoTokenRefresh.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start auto token refresh service',
      error: error.message
    });
  }
});

// Stop auto token refresh service
router.post('/auto-refresh/stop', logCalendarOperation('AUTO_REFRESH_STOP'), (req, res) => {
  try {
    autoTokenRefresh.stop();
    res.json({
      success: true,
      message: 'Auto token refresh service stopped',
      status: autoTokenRefresh.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop auto token refresh service',
      error: error.message
    });
  }
});

module.exports = router;

