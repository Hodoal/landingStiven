# Token Renewal de Google Calendar - Guía Completa

## 🔄 Sistema de Renovación Automática

Tu aplicación ahora tiene un **sistema de renovación automática de tokens de Google Calendar** que se inicia automáticamente cuando arranca el servidor.

### Características:
- ✅ **Verificación periódica**: Cada 5 minutos revisa si el token expira pronto
- ✅ **Renovación automática**: Renueva el token antes de que expire (buffer de 15 minutos)
- ✅ **Prevención de conflictos**: Evita múltiples renovaciones simultáneas
- ✅ **Logging detallado**: Registra cada operación de renovación
- ✅ **Integración total**: Funciona en `/api/index.js` y `/backend/server.js`

---

## 🛠️ Endpoints Disponibles

### 1. **Ver Estado del Auto-Refresh**
```bash
GET http://localhost:5001/api/calendar/auto-refresh/status
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "autoRefreshService": {
    "initialized": true,
    "isRunning": true,
    "checkIntervalMs": 300000,
    "checkIntervalMinutes": 5,
    "tokenStatus": {
      "hasRefreshToken": true,
      "hasAccessToken": true,
      "expiryDate": "2026-02-07T01:00:00.000Z",
      "expiryDateLocal": "2/7/2026, 1:00:00 AM",
      "isValid": true,
      "timeUntilExpiry": 3600000,
      "refreshInProgress": false
    }
  }
}
```

### 2. **Iniciar el Servicio de Auto-Refresh**
```bash
POST http://localhost:5001/api/calendar/auto-refresh/start
```

### 3. **Detener el Servicio de Auto-Refresh**
```bash
POST http://localhost:5001/api/calendar/auto-refresh/stop
```

### 4. **Ver Estado del Token (Detallado)**
```bash
GET http://localhost:5001/api/calendar/token/status
```

### 5. **Renovar Token Manualmente**
```bash
POST http://localhost:5001/api/calendar/token/refresh
```

---

## 📋 Cómo Obtener un Token de Refresco Válido

Si tu token está expirado o revocado (`error: "invalid_grant"`), necesitas obtener uno nuevo:

### **Paso 1: Obtener URL de Autorización**
```bash
node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  '$(grep GOOGLE_CLIENT_ID /home/ubuntu/landingStiven/api/.env | cut -d= -f2)',
  '$(grep GOOGLE_CLIENT_SECRET /home/ubuntu/landingStiven/api/.env | cut -d= -f2)',
  '$(grep GOOGLE_REDIRECT_URI /home/ubuntu/landingStiven/api/.env | cut -d= -f2)'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Abre esta URL:');
console.log(authUrl);
"
```

### **Paso 2: Autorizar y Obtener Código**
1. Copia la URL generada en tu navegador
2. Autoriza la aplicación
3. Copia el **código de autorización** que recibes

### **Paso 3: Intercambiar Código por Token**
```bash
node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  '$(grep GOOGLE_CLIENT_ID /home/ubuntu/landingStiven/api/.env | cut -d= -f2)',
  '$(grep GOOGLE_CLIENT_SECRET /home/ubuntu/landingStiven/api/.env | cut -d= -f2)',
  '$(grep GOOGLE_REDIRECT_URI /home/ubuntu/landingStiven/api/.env | cut -d= -f2)'
);

(async () => {
  try {
    const { tokens } = await oauth2Client.getToken('TU_CODIGO_AQUI');
    console.log('✅ Refresh Token:');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
"
```

### **Paso 4: Actualizar Variables de Entorno**

**Opción A: Actualizar manualmente**

Edita `/home/ubuntu/landingStiven/api/.env`:
```bash
GOOGLE_REFRESH_TOKEN=nuevo_token_aqui
```

**Opción B: Actualizar automáticamente**

```bash
sed -i "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=tu_nuevo_token/" /home/ubuntu/landingStiven/api/.env
sed -i "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=tu_nuevo_token/" /home/ubuntu/landingStiven/backend/.env
```

### **Paso 5: Reiniciar el Servidor**
```bash
pkill -f "node api/index.js" || true
sleep 2
cd /home/ubuntu/landingStiven && node api/index.js > /tmp/api.log 2>&1 &
```

### **Paso 6: Verificar que Funcionó**
```bash
sleep 5
curl -s http://localhost:5001/api/calendar/token/status | python3 -m json.tool
```

Deberías ver: `"isValid": true`

---

## 📊 Logs y Monitoreo

### Ver logs en tiempo real:
```bash
tail -f /tmp/api-token.log
```

### Buscar errores de token:
```bash
grep -i "token\|refresh\|error" /tmp/api-token.log
```

### Logs esperados cuando funciona correctamente:
```
✅ TokenManager: Token is valid. Expires at: 2/7/2026, 1:00:00 AM
✅ AutoTokenRefresh: Token is still valid
🔄 AutoTokenRefresh: Attempting to refresh token...
✅ TokenManager: Token refreshed successfully
```

---

## 🐛 Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| `error: "invalid_grant"` | Token revocado/expirado | Obtener nuevo token (ver pasos arriba) |
| Auto-refresh no inicia | NODE_ENV incorrecto | Verificar `.env` NODE_ENV=development |
| Token no se renueva | Servicio detenido | POST `/api/calendar/auto-refresh/start` |
| Error: "No refresh token" | Variable no configurada | Actualizar `GOOGLE_REFRESH_TOKEN` en `.env` |

---

## 🔒 Seguridad

- **Nunca** compartas tu `GOOGLE_REFRESH_TOKEN` públicamente
- **Nunca** comitas tokens en git (usa `.env` y `.gitignore`)
- Rota tus tokens regularmente
- Revoca tokens en Google Cloud Console si sospechas compromiso

---

## 📧 Variables Requeridas en `.env`

Tu archivo `/home/ubuntu/landingStiven/api/.env` debe contener:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stivenads-production

# Google Calendar Configuration
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback
GOOGLE_REFRESH_TOKEN=tu_refresh_token_aqui
```

---

## ✅ Verificación Rápida

```bash
# 1. API running?
curl http://localhost:5001/api/health

# 2. Token status?
curl http://localhost:5001/api/calendar/token/status

# 3. Auto-refresh running?
curl http://localhost:5001/api/calendar/auto-refresh/status

# 4. Recent logs?
tail -20 /tmp/api-token.log
```

---

**Creado:** Febrero 6, 2026  
**Última actualización:** Febrero 6, 2026
