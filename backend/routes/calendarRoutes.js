const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Placeholder for calendar routes - can be extended for additional calendar management
router.get('/status', (req, res) => {
  res.json({ 
    status: 'Calendar service is running',
    integratedWith: 'Google Calendar',
    hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
    mode: process.env.NODE_ENV === 'development' ? 'mock' : 'production'
  });
});

// GET auth URL for OAuth
router.get('/auth-url', (req, res) => {
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

// GET callback from Google OAuth
router.get('/auth/callback', async (req, res) => {
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
            <p>${error.message}</p>
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

module.exports = router;
