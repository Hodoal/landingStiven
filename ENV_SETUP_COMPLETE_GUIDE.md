# 🔐 Variables de Entorno - Paso a Paso Vercel Deployment

## 📋 Todas las Variables Necesarias

### **BACKEND - Variables Necesarias**

| Variable | Valor Actual | Descripción | Tipo |
|----------|-------------|-------------|------|
| `MONGODB_URI` | `mongodb://localhost:27017/stivenads` | Conexión MongoDB | URL |
| `PORT` | `3001` | Puerto backend | Number |
| `NODE_ENV` | `production` | Entorno | String |
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | Google OAuth ID | String |
| `GOOGLE_CLIENT_SECRET` | `xxxxx` | Google OAuth Secret | String |
| `GOOGLE_CALENDAR_ID` | `xxxxx@group.calendar.google.com` | ID del calendario | String |
| `GOOGLE_REFRESH_TOKEN` | `xxxxx` | Token de refresco Google | String |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3001/api/calendar/callback` | URL callback Google | URL |
| `GMAIL_USER` | `tu-email@gmail.com` | Email para enviar | String |
| `GMAIL_PASSWORD` | `app-password-google` | Contraseña app Google | String |
| `CORS_ORIGIN` | `https://tu-frontend.vercel.app` | Origen permitido CORS | URL |

---

### **FRONTEND - Variables Necesarias**

| Variable | Valor | Descripción | Ubicación |
|----------|-------|-------------|-----------|
| `VITE_API_URL` | `https://tu-backend.com` | URL Backend API | `.env.production` |

---

## 🚀 PASO A PASO - Deploy en Vercel

### **PASO 1: Obtener Credenciales Google Calendar**

#### Substep 1.1: Crear Proyecto en Google Cloud Console
```
1. Ve a https://console.cloud.google.com/
2. Click en "Select a Project" → "NEW PROJECT"
3. Nombre: "Landing Stiven"
4. Click en "CREATE"
5. Espera a que se cree (1-2 minutos)
```

#### Substep 1.2: Habilitar APIs Necesarias
```
1. En Google Cloud Console, busca "API"
2. Click en "Enable APIs and Services"
3. Busca y habilita:
   - Google Calendar API
   - Gmail API
   - Google+ API
```

#### Substep 1.3: Crear Credenciales OAuth2
```
1. Panel izquierdo → "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Selecciona "OAuth client ID"
4. Tipo de aplicación: "Web application"
5. Nombre: "Landing Stiven Backend"
6. Authorized redirect URIs:
   - http://localhost:3001/api/calendar/callback
   - https://tu-backend.vercel.app/api/calendar/callback
7. Click "CREATE"
8. Se abrirá popup con:
   - Client ID
   - Client Secret
9. Copia ambos y GUARDA en lugar seguro
```

#### Substep 1.4: Obtener Refresh Token
```bash
# En terminal, desde backend:
cd backend

# Instalar dependencia
npm install googleapis

# Crear archivo: get-refresh-token.js
# (ver abajo)

# Ejecutar:
node get-refresh-token.js

# Será direccionado a Google para autorizar
# Copiar el código que aparece
# Pegar en terminal
# Obtendrás el refresh token
```

**Contenido de `get-refresh-token.js`:**
```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_AQUI',
  process.env.GOOGLE_CLIENT_SECRET || 'TU_CLIENT_SECRET_AQUI',
  'http://localhost:3001/api/calendar/callback'
);

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Abre esta URL en tu navegador:');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Pega el código de autorización aquí: ', async (code) => {
  try {
    const { credentials } = await oauth2Client.getToken(code);
    console.log('Refresh Token:');
    console.log(credentials.refresh_token);
  } catch (error) {
    console.error('Error:', error);
  }
  rl.close();
});
```

#### Substep 1.5: Obtener Calendar ID
```
1. Ve a https://calendar.google.com
2. Clic derecho en tu calendario
3. "Settings"
4. Busca "Calendar ID"
5. Copia el ID (formato: xxxxx@group.calendar.google.com)
```

---

### **PASO 2: Configurar MongoDB Atlas (Cloud)**

#### Substep 2.1: Crear Cuenta
```
1. Ve a https://www.mongodb.com/cloud/atlas
2. Click "Register"
3. Crea cuenta con email
```

#### Substep 2.2: Crear Cluster
```
1. Click "Create" → "Build a Database"
2. Selecciona "M0 Sandbox" (GRATIS)
3. Provider: AWS
4. Region: us-east-1 (o cercana)
5. Click "Create Deployment"
```

#### Substep 2.3: Obtener Connection String
```
1. Click "Connect"
2. Selecciona "Drivers"
3. Node.js
4. Copiar connection string
5. Formato: mongodb+srv://user:password@cluster.mongodb.net/stivenads
```

#### Substep 2.4: Crear Usuario
```
1. En Atlas → "Database Access"
2. Click "+ ADD NEW DATABASE USER"
3. Username: (tu username)
4. Password: (genera contraseña segura)
5. Click "Create Database User"
6. La contraseña irá en CONNECTION STRING
```

---

### **PASO 3: Email Gmail - Contraseña de Aplicación**

#### Substep 3.1: Habilitar Autenticación 2FA
```
1. Ve a myaccount.google.com
2. Security → "2-Step Verification"
3. Completa el proceso
```

#### Substep 3.2: Crear Contraseña de Aplicación
```
1. Ve a myaccount.google.com/apppasswords
2. Selecciona "Mail" y "Windows Computer"
3. Google generará contraseña de 16 caracteres
4. Copia esta contraseña
5. Esta es tu GMAIL_PASSWORD
```

---

### **PASO 4: Verificar Variables en Local**

Crea archivo `.env` en `/backend`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/stivenads

# Google Calendar
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# Gmail
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Prueba local:
```bash
npm start
# Debe conectarse a MongoDB sin errores
```

---

### **PASO 5: Configurar Frontend en Vercel**

#### Substep 5.1: Crear proyecto en Vercel
```
1. Ve a https://vercel.com/new
2. Importa tu repo GitHub: landingStiven
```

#### Substep 5.2: Configurar proyecto
```
Project Name: landing-stiven
Framework: Vite
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
```

#### Substep 5.3: Agregar Variables de Entorno
```
En Vercel Dashboard:

1. Tu Proyecto → Settings → Environment Variables
2. Agrega:

Variable: VITE_API_URL
Value: https://tu-backend-vercel.app
Environment: Production
```

#### Substep 5.4: Deploy
```
Click "Deploy"
Espera 2-3 minutos
Tu URL estará en: https://landing-stiven.vercel.app
```

---

### **PASO 6: Desplegar Backend (Render.com - Recomendado)**

#### Substep 6.1: Crear Cuenta
```
Ve a https://render.com
Crea cuenta con GitHub
```

#### Substep 6.2: Crear Web Service
```
1. Dashboard → "New +" → "Web Service"
2. Conecta tu repo GitHub
3. Nombre: landing-stiven-backend
4. Environment: Node
5. Build Command: npm install
6. Start Command: npm start
```

#### Substep 6.3: Agregar Variables de Entorno
```
En Render Dashboard → Tu Service → Environment:

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stivenads
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=xxxxx
GOOGLE_REDIRECT_URI=https://landing-stiven-backend.onrender.com/api/calendar/callback
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://landing-stiven.vercel.app
```

#### Substep 6.4: Deploy
```
Click "Deploy"
Espera 3-5 minutos
Tu URL estará en: https://landing-stiven-backend.onrender.com
```

---

### **PASO 7: Actualizar URLs en Ambos Lados**

#### Frontend - Actualizar API URL
```
En frontend/.env.production:
VITE_API_URL=https://landing-stiven-backend.onrender.com
```

#### Backend - Actualizar CORS
```
En Render - Environment Variables:
CORS_ORIGIN=https://landing-stiven.vercel.app
```

#### Backend - Actualizar Google Redirect
```
En Render - Environment Variables:
GOOGLE_REDIRECT_URI=https://landing-stiven-backend.onrender.com/api/calendar/callback

También en Google Cloud Console:
Credentials → OAuth 2.0 Client IDs → Web application
Authorized redirect URIs:
- https://landing-stiven-backend.onrender.com/api/calendar/callback
```

---

## 📝 Checklist Completo

### Google Calendar Setup
- [ ] Proyecto creado en Google Cloud Console
- [ ] APIs habilitadas (Calendar, Gmail, Google+)
- [ ] OAuth2 Client ID creado
- [ ] Client Secret copiado
- [ ] Refresh Token obtenido
- [ ] Calendar ID copiado

### MongoDB Setup
- [ ] Cluster MongoDB Atlas creado
- [ ] Usuario de base de datos creado
- [ ] Connection String copiada

### Gmail Setup
- [ ] Autenticación 2FA habilitada
- [ ] Contraseña de aplicación generada

### Frontend Setup
- [ ] Proyecto en Vercel creado
- [ ] VITE_API_URL configurada
- [ ] Deploy exitoso

### Backend Setup
- [ ] Proyecto en Render creado
- [ ] Todas las variables de entorno agregadas
- [ ] Deploy exitoso

### Validación Final
- [ ] Frontend carga en https://landing-stiven.vercel.app
- [ ] API responde: https://landing-stiven-backend.onrender.com/api/health
- [ ] Database conecta sin errores
- [ ] Google Calendar funciona
- [ ] Emails se envían

---

## 🧪 Test de Verificación

```bash
# Test 1: Frontend
curl https://landing-stiven.vercel.app
# Debe retornar HTML

# Test 2: Backend Health
curl https://landing-stiven-backend.onrender.com/api/health
# Debe retornar: {"status":"OK","message":"Server is running"}

# Test 3: MongoDB
# Intenta crear un lead en tu app
# Debe guardarse en la BD

# Test 4: Google Calendar
# Crea una reunión en tu app
# Debe aparecer en Google Calendar

# Test 5: Email
# Crea un lead con email
# Debe recibir email de confirmación
```

---

## 🚨 Problemas Comunes

### "API no conecta"
```
Verificar:
1. VITE_API_URL correcta en frontend
2. CORS_ORIGIN correcta en backend
3. Backend en Render está corriendo
```

### "MongoDB connection error"
```
Verificar:
1. MONGODB_URI correcta
2. Usuario de BD creado en MongoDB Atlas
3. IP whitelist en MongoDB (Allow All)
```

### "Google Calendar no funciona"
```
Verificar:
1. GOOGLE_REFRESH_TOKEN válido
2. Google Redirect URI actualizada
3. APIs habilitadas en Google Cloud
```

### "Emails no se envían"
```
Verificar:
1. GMAIL_PASSWORD es de aplicación (no contraseña normal)
2. 2FA habilitado en Google
3. GMAIL_USER correcto
```

---

## 📚 Resumen URLs Finales

| Servicio | URL |
|----------|-----|
| **Frontend** | https://landing-stiven.vercel.app |
| **Backend API** | https://landing-stiven-backend.onrender.com |
| **MongoDB** | mongodb+srv://cluster.mongodb.net |
| **Google Cloud** | https://console.cloud.google.com |
| **MongoDB Atlas** | https://cloud.mongodb.com |

**¡Listo para producción!** 🚀
