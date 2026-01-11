# Stiven Ads - Landing Page & Admin Dashboard

Plataforma completa de asesorías de marketing con sistema de gestión de clientes, seguimiento de ventas y análisis de métricas.

## 📸 Vista Previa

![Admin Dashboard - Gestión de Clientes](./docs/screenshots/admin_dashboard.png)

## 🎯 Características

### Landing Page
- Diseño moderno y responsivo
- Formulario de agendamiento con validación
- Integración con Google Calendar
- Notificaciones por email
- Modal de términos y privacidad
- Cookie consent management

### Admin Dashboard
- **3 Secciones principales:**
  - 📋 Clientes Potenciales (no vendidos)
  - 💰 Clientes (vendidos)
  - 📈 Estadísticas y métricas

### Gestión de Clientes
- ✏️ Reprogramar reuniones
- ❌ Cancelar agendamientos
- 💵 Registrar ventas en COP
- 🗑️ Eliminar clientes
- 📊 Exportar a Excel
- 📅 Sincronización automática con Google Calendar

### Métricas & Analytics
- Conversión de visitantes → consultados
- Tasa de cierre (consultados → vendidos)
- Ingreso total y valor promedio
- Ingresos del mes actual
- Gráficos de tendencias (últimos 30 días)
- Embudo de ventas visual

### Automatización
- ✅ Detección automática de reuniones pasadas
- 🔄 Sincronización con Google Calendar
- 📧 Notificaciones por email
- 📱 Respuesta a confirmaciones

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Icons** - UI icons
- **XLSX** - Excel export
- **Tailwind CSS** - Styling (utilities)

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Google Calendar API** - Calendar integration
- **Gmail SMTP** - Email notifications
- **UUID** - Unique identifiers

## 📁 Estructura del Proyecto

```
landing_stiven/
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminPanel.css
│   │   │   ├── ClientsList.jsx
│   │   │   ├── ClientsList.css
│   │   │   ├── SoldClientsList.jsx
│   │   │   ├── Estadisticas.jsx
│   │   │   └── README.md
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   └── ... (otros componentes)
│   │   ├── pages/
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   ├── models/
│   │   └── Booking.js
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   └── calendarRoutes.js
│   ├── services/
│   │   ├── calendarService.js
│   │   └── emailService.js
│   ├── package.json
│   └── .env.example
└── package.json
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 16+
- MongoDB local o en la nube
- Google Calendar API key
- Gmail SMTP credentials

### Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/Hodoal/landing_page.git
cd landing_page
```

2. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurar variables de entorno**

**Backend** (`backend/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/stivenads
GOOGLE_API_KEY=tu_google_api_key
GOOGLE_CALENDAR_ID=tu_calendar_id
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

4. **Iniciar aplicación**

```bash
# Terminal 1: Backend
cd backend
node server.js

# Terminal 2: Frontend
cd frontend
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Admin**: http://localhost:5174/admin

## 📊 API Endpoints

### Bookings
- `GET /api/booking/list` - Listar todos los clientes
- `POST /api/booking/create` - Crear nuevo agendamiento
- `GET /api/booking/available-times?date=YYYY-MM-DD` - Horarios disponibles
- `PUT /api/booking/:id/reschedule` - Reprogramar reunión
- `PUT /api/booking/:id/cancel` - Cancelar agendamiento
- `PUT /api/booking/:id/confirm-sale` - Registrar venta
- `DELETE /api/booking/:id` - Eliminar cliente

### Calendar
- `GET /api/calendar/availability` - Disponibilidad del calendario
- `GET /api/calendar/events` - Listar eventos

## 💾 Base de Datos

### Modelo Booking
```javascript
{
  clientName: String,
  email: String,
  phone: String,
  company: String,
  message: String,
  date: String (YYYY-MM-DD),
  time: String (HH:MM),
  meetLink: String,
  googleCalendarEventId: String,
  status: 'pending' | 'confirmed' | 'meeting-completed' | 'sold' | 'cancelled',
  venta_confirmada: Boolean,
  monto_venta: Number,
  fecha_venta: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Flujo de Estados

```
pending → confirmed → meeting-completed → sold
    ↓         ↓              ↓
cancelled   cancelled     cancelled
```

### Estados:
- **pending**: Agendamiento inicial
- **confirmed**: Cliente confirmó reunión
- **meeting-completed**: Reunión pasada, en espera de confirmación de venta
- **sold**: Venta registrada (cliente pasa a sección "Clientes")
- **cancelled**: Cancelado por el usuario

## 📈 Métricas Principales

1. **Tasa de Conversión** = (Consultadas / Agendadas) × 100
2. **Tasa de Cierre** = (Ventas / Consultadas) × 100
3. **Valor Promedio** = Ingreso Total / Ventas Realizadas
4. **Embudo de Ventas**: Visitantes → Consultadas → Ventas Cerradas

## 🔐 Seguridad

- Variables de entorno para credenciales
- CORS habilitado para desarrollo
- Validación de entrada en backend
- Manejo de errores robusto

## 📚 Documentación Adicional

- [API Setup](./API_SETUP.md) - Configuración detallada de APIs
- [Google Calendar Setup](./GOOGLE_CALENDAR_SETUP.md) - Integración con Google Calendar
- [Email Setup](./EMAIL_SETUP.md) - Configuración de notificaciones
- [MongoDB Setup](./MONGODB_SETUP.md) - Base de datos
- [Deployment](./DEPLOYMENT.md) - Despliegue en producción

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error
Solución: Verificar que MongoDB esté corriendo localmente o actualizar MONGODB_URI
```

### Google Calendar API Error
```
Error: Google Calendar event creation failed
Solución: Verificar credenciales de Google API en .env
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS
Solución: Verificar que backend esté en puerto 3001 y proxy en vite.config.js
```

## 📋 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] MongoDB en la nube (Atlas)
- [ ] Google Calendar API configurado
- [ ] Email SMTP configurado
- [ ] Frontend compilado (npm run build)
- [ ] Backend con PM2 o similar
- [ ] HTTPS habilitado
- [ ] Backups de base de datos

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📞 Contacto

**Stiven Ads**
- Email: info@stivenads.com
- Website: [Tu sitio web]

## 🎉 Agradecimientos

- React community
- Google Calendar API
- MongoDB
- Vite team

---

**Última actualización**: 10 de enero de 2026
**Versión**: 1.0.0
