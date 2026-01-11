# Guía Rápida de Inicio

## 1. Instalación Inicial

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Windows
```bash
setup.bat
```

## 2. Configuración de Variables de Entorno

### Backend (.env)

Edita `backend/.env` con tus credenciales:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/stivenads

# Google Calendar
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALENDAR_ID=tu_email@gmail.com
GOOGLE_REFRESH_TOKEN=tu_refresh_token

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
EMAIL_FROM=noreply@stivenads.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 3. Iniciar la Aplicación

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 4. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 5. Pruebas

### Probar Agendamiento
1. Abre http://localhost:5173
2. Haz clic en "Agendar"
3. Completa el formulario
4. Selecciona una fecha y hora
5. Deberías recibir un email de confirmación

### Probar API Directamente
```bash
# Ver horarios disponibles
curl "http://localhost:3001/api/booking/available-times?date=2024-01-20"

# Health check
curl http://localhost:3001/api/health
```

## Configuraciones Importantes

### MongoDB Local

Si no tienes MongoDB corriendo:
```bash
# macOS con Homebrew
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 mongo
```

### Google Calendar Setup
Ver archivo `GOOGLE_CALENDAR_SETUP.md` para instrucciones detalladas

### Email Setup
Ver archivo `EMAIL_SETUP.md` para configurar Gmail

## Estructura de Carpetas

```
landing_stiven/
├── frontend/          # Aplicación React
│   └── src/
│       └── components/  # Componentes React
├── backend/           # Servidor Node.js
│   ├── models/        # Modelos MongoDB
│   ├── routes/        # Rutas API
│   └── services/      # Servicios (email, calendar)
├── README.md          # Documentación principal
├── setup.sh           # Script de instalación (macOS/Linux)
└── setup.bat          # Script de instalación (Windows)
```

## Solucionar Problemas

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "MongoDB connection refused"
- Asegúrate que MongoDB está corriendo
- Verifica la URI en .env

### "Email not sending"
- Verifica EMAIL_USER y EMAIL_PASSWORD
- Asegúrate de haber generado contraseña de aplicación en Google

### Port 3001 already in use
```bash
# Cambiar puerto en server.js
PORT=3002
```

## Deployment

### Deploy Frontend (Vercel)
```bash
cd frontend
npm run build
# Seguir instrucciones de Vercel
```

### Deploy Backend (Heroku)
```bash
cd backend
heroku create stivenads-backend
git push heroku main
```

## Próximos Pasos

- [ ] Completar configuración de Google Calendar
- [ ] Completar configuración de Email
- [ ] Probar flujo completo de agendamiento
- [ ] Personalizar contenido de la landing page
- [ ] Agregar más horarios de disponibilidad
- [ ] Implementar panel de administración

## Soporte

Para ayuda, consulta:
- [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md)
- [EMAIL_SETUP.md](EMAIL_SETUP.md)
- [README.md](README.md)
