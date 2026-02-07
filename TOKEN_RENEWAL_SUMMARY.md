# 🔄 Renovación Automática de Tokens de Google Calendar - IMPLEMENTADA

## ✅ Solución Completa

Tu aplicación ahora cuenta con un **sistema automático de renovación de tokens de Google Calendar** que:

1. ✅ **Verifica periódicamente** si el token está por expirar (cada 5 minutos)
2. ✅ **Renueva automáticamente** antes de que expire (buffer de seguridad de 15 minutos)
3. ✅ **Previene conflictos** de renovación simultánea
4. ✅ **Registra todo** en logs detallados
5. ✅ **Permite control manual** a través de endpoints

---

## 🚀 Componentes Implementados

### 1. **Servicio AutoTokenRefresh** (`backend/services/autoTokenRefresh.js`)
- Clase `AutoTokenRefresh` que gestiona renovaciones periódicas
- Check cada 5 minutos
- Se inicia automáticamente al arrancar el servidor
- Proporciona métodos: `start()`, `stop()`, `getStatus()`

### 2. **Integración en Servidores**
```javascript
// ✅ /api/index.js
const { autoTokenRefresh } = require('../backend/services/autoTokenRefresh');
// ... después de cargar rutas:
autoTokenRefresh.start();

// ✅ /backend/server.js
const { autoTokenRefresh } = require('./services/autoTokenRefresh');
// ... después de definir rutas:
autoTokenRefresh.start();
```

### 3. **Nuevos Endpoints Calendar**
- `GET  /api/calendar/auto-refresh/status` - Ver estado del servicio
- `POST /api/calendar/auto-refresh/start` - Iniciar auto-refresh
- `POST /api/calendar/auto-refresh/stop` - Detener auto-refresh

### 4. **Middleware Mejorado**
- `ensureValidToken` - Valida y renueva automáticamente antes de operaciones
- `requireValidToken` - Requiere token válido o rechaza la request
- `logCalendarOperation` - Registra todas las operaciones

### 5. **TokenManager Potenciado**
- `getValidatedClient()` - Retorna cliente con token garantizado válido
- `isTokenValid()` - Verifica validez con buffer de 15 minutos
- `forceRefresh()` - Renueva token bajo demanda
- `updateRefreshTokenInEnv()` - Actualiza token en archivos .env

---

## 🛠️ Cómo Usar

### Ver Estado del Auto-Refresh (En Tiempo Real)
```bash
curl http://localhost:5001/api/calendar/auto-refresh/status | python3 -m json.tool
```

### Ver Estado del Token
```bash
curl http://localhost:5001/api/calendar/token/status | python3 -m json.tool
```

### Renovar Token Manualmente
```bash
curl -X POST http://localhost:5001/api/calendar/token/refresh | python3 -m json.tool
```

### Monitorear Logs en Tiempo Real
```bash
tail -f /tmp/api-token.log
```

---

## 🔐 Si el Token Expira

### Opción 1: Script Interactivo (Recomendado)
```bash
/home/ubuntu/landingStiven/scripts/renew-calendar-token.sh
```

**Qué hace:**
1. Genera URL de autorización de Google
2. Te guía a través del flujo de autenticación
3. Obtiene el nuevo refresh token
4. Actualiza automáticamente los archivos .env
5. Reinicia el servidor

### Opción 2: Manual
```bash
# 1. Obtener nuevo refresh token (ver CALENDAR_TOKEN_RENEWAL.md)

# 2. Actualizar .env
sed -i "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=nuevo_token/" /home/ubuntu/landingStiven/api/.env
sed -i "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=nuevo_token/" /home/ubuntu/landingStiven/backend/.env

# 3. Reiniciar servidor
pkill -f "node api/index.js"
sleep 2
cd /home/ubuntu/landingStiven && node api/index.js > /tmp/api.log 2>&1 &
```

---

## 📊 Flujo de Renovación Automática

```
┌─────────────────────────────────────────────────┐
│  Servidor Inicia                                │
│  autoTokenRefresh.start()                       │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Check Inicial                                  │
│  ¿Token válido? → SI: Log "Token válido"       │
│                → NO: Renovar automáticamente   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Cada 5 minutos:            │
        │  - Verificar validez        │
        │  - Si expira en <15 min:    │
        │    Renovar automáticamente  │
        │  - Log de operación         │
        └─────────────────────────────┘
```

---

## 🔍 Logs Esperados

### ✅ Cuando funciona correctamente:
```
🚀 AutoTokenRefresh: Starting automatic token refresh service
✅ AutoTokenRefresh: Service initialized successfully

📊 AutoTokenRefresh: Periodic token check
✅ TokenManager: Token is valid. Expires at: 2/7/2026, 1:00:00 AM
✅ AutoTokenRefresh: Token is still valid
```

### ❌ Cuando el token está expirado:
```
⚠️ TokenManager: No access token found
🔄 AutoTokenRefresh: Attempting to refresh token...
❌ TokenManager: Error refreshing token: invalid_grant
   Token has been expired or revoked.
```
→ **Solución:** Ejecutar `/home/ubuntu/landingStiven/scripts/renew-calendar-token.sh`

---

## 📁 Archivos Modificados/Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `backend/services/autoTokenRefresh.js` | ✨ NUEVO | Sistema de auto-refresh |
| `api/index.js` | 📝 ACTUALIZADO | Integración del servicio |
| `backend/server.js` | 📝 ACTUALIZADO | Integración del servicio |
| `backend/routes/calendarRoutes.js` | 📝 ACTUALIZADO | Nuevos endpoints |
| `CALENDAR_TOKEN_RENEWAL.md` | 📖 NUEVO | Documentación completa |
| `scripts/renew-calendar-token.sh` | 🔧 NUEVO | Script de renovación |

---

## 🚨 Checklist de Verificación

- [x] Auto-refresh inicializa al arrancar servidor
- [x] Verifica token cada 5 minutos
- [x] Renueva automáticamente si es necesario
- [x] Endpoints disponibles para control manual
- [x] Logging detallado de operaciones
- [x] Script interactivo para renovación
- [x] Actualización automática de .env
- [x] Reinicio automático después de renovar
- [x] Buffer de 15 minutos para prevenir expiración
- [x] Prevención de renovaciones concurrentes

---

## 📞 Soporte Rápido

**¿El token está expirado?**
```bash
/home/ubuntu/landingStiven/scripts/renew-calendar-token.sh
```

**¿Ver estado actual?**
```bash
curl http://localhost:5001/api/calendar/token/status
```

**¿Ver logs?**
```bash
tail -f /tmp/api-token.log | grep -i token
```

**¿Reiniciar servicio?**
```bash
pkill -f "node api/index.js" && sleep 2 && cd /home/ubuntu/landingStiven && node api/index.js > /tmp/api.log 2>&1 &
```

---

## 🎯 Próximos Pasos (Opcional)

Para una configuración aún más robusta, considera:

1. **Alertas por Email** - Notificar cuando token está bajo de expiración
2. **Dashboard de Monitoreo** - Vista en tiempo real del estado del token
3. **Backup de Token** - Guardar tokens en base de datos para recuperación
4. **Métricas** - Registrar número de renovaciones exitosas/fallidas

---

**✅ Implementado:** Febrero 6, 2026  
**Estado:** Funcionando correctamente  
**Próxima renovación:** Automática cuando sea necesario

