# 🔐 Variables de Entorno - Deployment Vercel + Render

## 📋 RESUMEN EJECUTIVO

Tu aplicación necesita 4 tipos de servicios externos:

| Servicio | Uso | URL |
|----------|-----|-----|
| **MongoDB** | Base de datos | https://cloud.mongodb.com |
| **Google Cloud** | Calendar + Gmail API | https://console.cloud.google.com |
| **Vercel** | Frontend hosting | https://vercel.com |
| **Render** | Backend hosting | https://render.com |

---

## 🔑 Variables Totales: 10

### Backend (8 variables)
```
1. MONGODB_URI           ← Base de datos
2. GOOGLE_CLIENT_ID      ← Google OAuth
3. GOOGLE_CLIENT_SECRET  ← Google OAuth
4. GOOGLE_CALENDAR_ID    ← ID del calendario
5. GOOGLE_REFRESH_TOKEN  ← Token Google
6. GOOGLE_REDIRECT_URI   ← Callback URL
7. GMAIL_USER            ← Email para enviar
8. GMAIL_PASSWORD        ← Contraseña app
```

### Frontend (1 variable)
```
9. VITE_API_URL          ← URL del backend
```

### Server (1 variable)
```
10. CORS_ORIGIN          ← Origen permitido
```

---

## 🚀 PASO A PASO COMPLETO

### **FASE 1: Obtener Credenciales (1-2 horas)**

#### Paso 1.1: MongoDB
```
1. https://www.mongodb.com/cloud/atlas → Registrarse
2. Create → Cluster (M0 gratuito)
3. Database Access → Crear usuario
4. Connect → Copiar connection string
5. Reemplazar: mongodb+srv://USER:PASS@cluster.mongodb.net/stivenads

RESULTADO: mongodb+srv://user:pass@cluster.mongodb.net/stivenads
```

#### Paso 1.2: Google Cloud Setup
```
1. https://console.cloud.google.com → Crear proyecto
2. APIs → Habilitar:
   - Google Calendar API
   - Gmail API
   - Google+ API
3. Credentials → OAuth 2.0 Client ID (Web Application)
4. URIs autorizadas:
   - http://localhost:3001/api/calendar/callback
   - https://tu-backend.onrender.com/api/calendar/callback

RESULTADO:
- GOOGLE_CLIENT_ID: 123456.apps.googleusercontent.com
- GOOGLE_CLIENT_SECRET: xxxxx_xxxxx
```

#### Paso 1.3: Obtener Refresh Token
```
1. Crear archivo: backend/get-refresh-token.js
2. Ejecutar: node get-refresh-token.js
3. Abrir URL en navegador
4. Autorizar acceso
5. Copiar código
6. Pegar en terminal
7. Google devuelve refresh token

RESULTADO:
- GOOGLE_REFRESH_TOKEN: 1//xxxxx_xxxxx
```

#### Paso 1.4: Google Calendar ID
```
1. https://calendar.google.com
2. Clic derecho en tu calendario
3. Settings → Buscar "Calendar ID"
4. Copiar (formato: xxxxx@group.calendar.google.com)

RESULTADO:
- GOOGLE_CALENDAR_ID: xxxxx@group.calendar.google.com
```

#### Paso 1.5: Gmail App Password
```
1. https://myaccount.google.com → Security
2. 2-Step Verification (activar si no está)
3. App passwords → Mail + Windows Computer
4. Google genera 16 caracteres
5. Copiar exactamente (con espacios)

RESULTADO:
- GMAIL_USER: tu-email@gmail.com
- GMAIL_PASSWORD: xxxx xxxx xxxx xxxx
```

---

### **FASE 2: Deploy Backend en Render (30 mins)**

```
1. https://render.com → Registrarse con GitHub
2. New → Web Service
3. Conectar repo: landingStiven
4. Configurar:
   - Name: landing-stiven-backend
   - Environment: Node
   - Build: npm install
   - Start: npm start
5. Environment Variables → Agregar todos (10 variables):

   MONGODB_URI=mongodb+srv://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALENDAR_ID=...
   GOOGLE_REFRESH_TOKEN=...
   GOOGLE_REDIRECT_URI=https://landing-stiven-backend.onrender.com/api/calendar/callback
   GMAIL_USER=...
   GMAIL_PASSWORD=...
   NODE_ENV=production
   CORS_ORIGIN=https://landing-stiven.vercel.app

6. Click Deploy
7. Esperar 3-5 minutos
8. URL: https://landing-stiven-backend.onrender.com

TEST: curl https://landing-stiven-backend.onrender.com/api/health
```

---

### **FASE 3: Deploy Frontend en Vercel (20 mins)**

```
1. https://vercel.com/new → Importar repo
2. Seleccionar: landingStiven
3. Configurar:
   - Project: landing-stiven
   - Framework: Vite
   - Root: ./frontend
4. Environment Variables:
   - VITE_API_URL=https://landing-stiven-backend.onrender.com
5. Deploy
6. Esperar 2-3 minutos
7. URL: https://landing-stiven.vercel.app

TEST: Abrir en navegador y verificar que funciona
```

---

### **FASE 4: Validación Final (10 mins)**

```
✅ Test 1: Frontend carga
   https://landing-stiven.vercel.app

✅ Test 2: Backend responde
   curl https://landing-stiven-backend.onrender.com/api/health

✅ Test 3: Database conecta
   Crear un lead en la app (debe guardarse sin errores)

✅ Test 4: Google Calendar funciona
   Crear una reunión (debe aparecer en Google Calendar)

✅ Test 5: Email funciona
   Crear un lead (debe recibir email)
```

---

## 📁 Archivos de Referencia

He creado estos archivos en tu repo:

| Archivo | Descripción |
|---------|-------------|
| **ENV_SETUP_COMPLETE_GUIDE.md** | Guía paso a paso detallada (⭐ LEER ESTO) |
| **ENV_QUICK_REFERENCE.md** | Referencia rápida con todas las variables |
| **.env.template** | Template con comentarios para cada variable |
| **setup-env.sh** | Script que crea archivos .env automáticamente |

---

## 🎯 Orden Exacto a Seguir

1. ✅ Completar FASE 1 (obtener credenciales)
2. ✅ Crear archivo backend/.env con todas las variables
3. ✅ Probar en local: `npm start` (desde backend)
4. ✅ Completar FASE 2 (Deploy Backend en Render)
5. ✅ Completar FASE 3 (Deploy Frontend en Vercel)
6. ✅ Completar FASE 4 (Validación)

---

## ⚠️ Errores Comunes

### "API no conecta"
- ✅ Verificar VITE_API_URL en Vercel
- ✅ Verificar CORS_ORIGIN en Render
- ✅ Backend debe estar corriendo

### "MongoDB connection error"
- ✅ MONGODB_URI correcta
- ✅ Usuario creado en MongoDB Atlas
- ✅ IP whitelist en MongoDB

### "Google Calendar no funciona"
- ✅ GOOGLE_REFRESH_TOKEN válido
- ✅ Google Redirect URI actualizada
- ✅ APIs habilitadas

### "Emails no se envían"
- ✅ GMAIL_PASSWORD es de APP, no contraseña normal
- ✅ 2FA habilitado en Google
- ✅ GMAIL_USER correcto

---

## 🎊 URLs Finales

```
Frontend:  https://landing-stiven.vercel.app
Backend:   https://landing-stiven-backend.onrender.com
```

---

**📍 Siguiente paso:** Leer `ENV_SETUP_COMPLETE_GUIDE.md` para instrucciones detalladas
