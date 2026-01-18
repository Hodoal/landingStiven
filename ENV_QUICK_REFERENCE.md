# 🔐 Variables de Entorno - Referencia Rápida

## 📋 Todas las Variables Necesarias

### **BACKEND (.env o Render Environment Variables)**

```bash
# ===== MONGODB =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stivenads

# ===== GOOGLE CALENDAR =====
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
GOOGLE_REFRESH_TOKEN=xxxxx
GOOGLE_REDIRECT_URI=https://landing-stiven-backend.onrender.com/api/calendar/callback

# ===== GMAIL SENDING =====
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# ===== SERVER =====
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://landing-stiven.vercel.app
```

### **FRONTEND (.env.production o Vercel Environment Variables)**

```bash
VITE_API_URL=https://landing-stiven-backend.onrender.com
```

---

## 🚀 Quick Start - 5 Pasos Esenciales

### 1️⃣ Google Calendar Credentials
```
Console: https://console.cloud.google.com
- Crear proyecto
- Habilitar Calendar + Gmail APIs
- Crear OAuth2 Web Application
- Client ID → GOOGLE_CLIENT_ID
- Client Secret → GOOGLE_CLIENT_SECRET
```

### 2️⃣ Google Refresh Token
```bash
cd backend
# Usar el script get-refresh-token.js (ver guide)
node get-refresh-token.js
# Copia el refresh token → GOOGLE_REFRESH_TOKEN
```

### 3️⃣ MongoDB Connection
```
Atlas: https://www.mongodb.com/cloud/atlas
- Crear cluster M0
- Crear usuario
- Copiar connection string
- Reemplazar user:password
- Agregar /stivenads al final
```

### 4️⃣ Gmail Password
```
https://myaccount.google.com/apppasswords
- Seleccionar Mail + Windows Computer
- Google genera 16 caracteres
- Esto es GMAIL_PASSWORD
```

### 5️⃣ Desplegar
```
Frontend: Vercel (conectar GitHub)
Backend: Render (conectar GitHub)
Agregar variables de entorno en ambos
```

---

## 📌 Valores por Entorno

### LOCAL Development (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/stivenads
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/callback
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### PRODUCTION (Render Environment Variables)
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stivenads
GOOGLE_REDIRECT_URI=https://landing-stiven-backend.onrender.com/api/calendar/callback
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://landing-stiven.vercel.app
```

---

## ✅ Verificación Rápida

```bash
# Test 1: Backend Health
curl https://landing-stiven-backend.onrender.com/api/health

# Test 2: Check Logs
vercel logs landing-stiven          # Frontend logs
# En Render: Ver logs en dashboard

# Test 3: Test Database
# Ir a app y crear un lead
# Debe guardarse sin errores
```

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| Google Cloud Console | https://console.cloud.google.com |
| Google App Passwords | https://myaccount.google.com/apppasswords |
| MongoDB Atlas | https://cloud.mongodb.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Render Dashboard | https://dashboard.render.com |

---

## 📝 Orden Correcto

1. ✅ Google credentials (Client ID, Secret, Refresh Token)
2. ✅ Google Calendar ID
3. ✅ MongoDB connection string
4. ✅ Gmail password
5. ✅ Vercel deploy con VITE_API_URL
6. ✅ Render deploy con todas las variables
7. ✅ Actualizar Google Redirect URIs

---

**Nota:** Si algo falla, revisar `ENV_SETUP_COMPLETE_GUIDE.md` para paso a paso detallado.
