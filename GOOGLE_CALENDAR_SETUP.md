# Guía de Configuración de Google Calendar API

## Paso 1: Crear Proyecto en Google Cloud Console

1. Accede a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Seleccionar un proyecto" > "Nuevo proyecto"
3. Nombra tu proyecto "Stivenads"
4. Haz clic en "Crear"

## Paso 2: Habilitar Google Calendar API

1. En la barra de búsqueda, busca "Google Calendar API"
2. Haz clic en "Google Calendar API"
3. Haz clic en el botón "Habilitar"

## Paso 3: Crear Credenciales OAuth

1. Ve a "Credenciales" en el menú lateral
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth"
3. Selecciona "Aplicación de escritorio" como tipo
4. Haz clic en "Crear"
5. Descarga el JSON

## Paso 4: Configurar Pantalla de Consentimiento

1. Ve a "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo"
3. Completa los campos requeridos:
   - Nombre de la app: Stivenads
   - Email de soporte: tu@email.com
4. Añade estos scopes:
   - https://www.googleapis.com/auth/calendar
   - https://www.googleapis.com/auth/calendar.events

## Paso 5: Obtener Refresh Token

Ejecuta este script (adaptado a tu configuración):

```javascript
const { google } = require('googleapis');
const fs = require('fs');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3001/api/calendar/auth/callback'
);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Visit this URL:', url);
// Después de autorizar, copia el código y úsalo aquí:
// oauth2Client.getToken(code, (err, token) => {
//   console.log('Refresh Token:', token.refresh_token);
// });
```

## Paso 6: Configurar en .env

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CALENDAR_ID=tu_email@gmail.com
```

## Verificación

Para verificar que la configuración es correcta, ejecuta:

```bash
npm run dev
```

Y accede a `http://localhost:3001/api/health`

Deberías ver: `{ status: 'OK', message: 'Server is running' }`
