# Configuración de APIs - Stivenads

## Estado Actual
✅ Backend corriendo en puerto 3001
✅ Frontend corriendo en puerto 5173  
✅ Proxy configurado en Vite para `/api` → `http://localhost:3001`
✅ Booking API funcionando (básica, sin BD)

---

## 1. Google Calendar API (PRÓXIMA PRIORIDAD)

### Pasos:
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar "Google Calendar API"
4. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - Redirects autorizados: `http://localhost:3001/api/calendar/auth/callback`
5. Copiar `Client ID` y `Client Secret`
6. Actualizar `.env` en backend:
   ```
   GOOGLE_CLIENT_ID=<tu_client_id>
   GOOGLE_CLIENT_SECRET=<tu_client_secret>
   GOOGLE_CALENDAR_ID=<tu_calendar_id>
   ```

---

## 2. Email Configuration (PRÓXIMA PRIORIDAD)

### Gmail Setup:
1. Habilitar "App Passwords" en tu cuenta Google
2. Generar contraseña de aplicación
3. Actualizar `.env`:
   ```
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=<tu_app_password>
   EMAIL_FROM=noreply@stivenads.com
   ```

---

## 3. MongoDB (OPCIONAL - Funciona sin ella)

Si quieres persistencia de datos:
1. Instalar MongoDB localmente o usar Atlas Cloud
2. URL por defecto: `mongodb://localhost:27017/stivenads`
3. Actualizar `.env` si es necesario

---

## 4. Endpoints Disponibles

### Booking
- `GET /api/booking/available-times?date=YYYY-MM-DD`
  - Retorna slots disponibles para una fecha

- `POST /api/booking/create`
  - Body: `{ name, email, phone, company, message, date, time }`
  - Crea una nueva cita

### Calendar (Por configurar)
- `GET /api/calendar/auth` - Inicia autenticación con Google
- `GET /api/calendar/auth/callback` - Callback de Google
- `GET /api/calendar/events?date=YYYY-MM-DD` - Eventos de ese día

### Health Check
- `GET /api/health` - Verifica estado del servidor

---

## 5. Variables de Entorno Template

```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/stivenads
PORT=3001
NODE_ENV=development

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_CALENDAR_ID=YOUR_CALENDAR_ID
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/auth/callback

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@stivenads.com

TEAMS_WEBHOOK_URL=your_teams_webhook

FRONTEND_URL=http://localhost:5173
```

---

## 6. Testing

### Probar Booking:
```bash
curl -X POST http://localhost:3001/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+57 300 000 0000",
    "company": "Test Co",
    "message": "Test message",
    "date": "2026-01-15",
    "time": "10:00"
  }'
```

### Probar disponibilidad:
```bash
curl http://localhost:3001/api/booking/available-times?date=2026-01-15
```

---

## 7. Próximos Pasos

1. **Configurar Google Calendar** - Necesario para sincronizar citas
2. **Configurar Email** - Para enviar confirmaciones
3. **Conectar MongoDB** - Para persistencia real de datos
4. **Configurar Teams** - Para reuniones virtuales
5. **Implementar Admin Panel** - Ya existe en `/admin`

---

**Nota:** El sistema está funcionando en modo "development". Para producción, necesitarás:
- Base de datos MongoDB real
- Credenciales reales de Google y Email
- HTTPS
- Validación adicional
