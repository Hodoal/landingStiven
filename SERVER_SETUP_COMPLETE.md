# ✅ Configuración Completa del Servidor - Stivenads

**Fecha:** 2026-01-21  
**IP Pública:** 51.222.26.28  
**Sistema:** Ubuntu 25.04 LTS  

---

## 🗄️ Base de Datos - MongoDB 7.0.28

### Instalación y Configuración
```bash
# MongoDB instalado desde repositorio oficial
# Versión: 7.0.28
# Puerto: 27017 (local)
# Base de datos: stivenads
```

### Estado del Servicio
```bash
sudo systemctl status mongod
# ✅ Active (running)
# ✅ Enabled (inicio automático)
```

### Colecciones Iniciales
- **consultants**: 1 documento (Consultor Stivenads)
- **leads**: Aplicaciones de programa piloto
- **bookings**: Reservas de asesorías

### Acceso
```bash
# Conectar a MongoDB
mongosh stivenads

# Ver estadísticas
mongosh stivenads --eval "db.stats()"

# Ver consultores
mongosh stivenads --eval "db.consultants.find().pretty()"
```

---

## 🚀 Backend - Node.js + Express

### Stack Tecnológico
- **Node.js:** v24.13.0
- **npm:** 11.6.2
- **Framework:** Express.js
- **ODM:** Mongoose
- **Puerto:** 3001

### Servicio Systemd
```bash
# Archivo: /etc/systemd/system/stivenads-backend.service
# Estado: ✅ Active (running) + Enabled

# Comandos útiles
sudo systemctl status stivenads-backend
sudo systemctl restart stivenads-backend
sudo journalctl -u stivenads-backend -f
```

### Rutas API Disponibles

#### Consultores
- `GET /api/consultants` - Lista de consultores activos
- `GET /api/consultants/:id` - Detalles de consultor
- `GET /api/consultants/:id/available-times` - Horarios disponibles

#### Leads (Aplicaciones Piloto)
- `POST /api/leads/apply-pilot` - Enviar aplicación
- `GET /api/leads/admin/leads` - Lista de leads (admin)

#### Booking (Reservas)
- `GET /api/booking/list` - Lista de reservas
- `POST /api/booking/create` - Crear reserva

#### Calendar
- `GET /api/calendar/status` - Estado de Google Calendar
- `GET /api/calendar/available-dates` - Fechas disponibles

#### Health
- `GET /api/health` - Health check
- `GET /` - Info del servidor

---

## 🌐 Nginx - Servidor Web

### Configuración
```nginx
# Archivo: /etc/nginx/sites-available/stivenads
# Puerto: 80 (HTTP)
# Upstream: localhost:3001

# Rutas
location /api/ → Backend Express
location / → Frontend React (dist/)
```

### Estado
```bash
sudo systemctl status nginx
# ✅ Active (running)
```

---

## 📧 Integraciones Configuradas

### Google Calendar API
- **Client ID:** Configurado ✅
- **Client Secret:** Configurado ✅
- **Calendar ID:** stivenads25@gmail.com
- **Refresh Token:** Configurado ✅
- **Estado:** Funcionando correctamente

**Funcionalidad:**
- Crear eventos automáticamente al agendar reuniones
- Verificar disponibilidad en tiempo real
- Enviar invitaciones por email

### Gmail SMTP
- **Usuario:** stivenads25@gmail.com
- **Password:** Configurado (App Password)
- **Servicio:** Gmail

**Emails Automáticos:**
- Confirmación de aplicación piloto
- Notificaciones al admin
- Confirmación de reservas

---

## 🔐 Variables de Entorno

### Archivo: `/home/ubuntu/landingStiven/.env`

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/stivenads
API_URL=http://51.222.26.28
FRONTEND_URL=http://51.222.26.28

# Google Calendar
GOOGLE_CLIENT_ID=[REDACTED_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[REDACTED_GOOGLE_CLIENT_SECRET]
GOOGLE_CALENDAR_ID=stivenads25@gmail.com
GOOGLE_REFRESH_TOKEN=[REDACTED]

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=stivenads25@gmail.com
EMAIL_PASSWORD=[REDACTED]
```

---

## 📊 Datos de Prueba Iniciales

### Consultor Principal
```javascript
{
  name: 'Consultor Stivenads',
  email: 'stivenads25@gmail.com',
  phone: '+57 300 1234567',
  specialization: 'Marketing Digital y Google Ads',
  bio: 'Experto en marketing digital con más de 5 años de experiencia',
  hourlyRate: 150000,
  isActive: true,
  availability: {
    monday: { start: '08:00', end: '22:00' },
    tuesday: { start: '08:00', end: '22:00' },
    wednesday: { start: '08:00', end: '22:00' },
    thursday: { start: '08:00', end: '22:00' },
    friday: { start: '08:00', end: '22:00' },
    saturday: { start: '08:00', end: '18:00' },
    sunday: { start: '10:00', end: '16:00' }
  }
}
```

---

## 🧪 Pruebas de Funcionamiento

### 1. Verificar MongoDB
```bash
mongosh stivenads --eval "db.consultants.countDocuments()"
# Resultado esperado: 1
```

### 2. Verificar API Health
```bash
curl http://51.222.26.28/api/health
# {"status":"OK","timestamp":"..."}
```

### 3. Obtener Consultores
```bash
curl http://51.222.26.28/api/consultants | jq '.'
# Array con consultor(es)
```

### 4. Probar Aplicación Piloto
```bash
curl -X POST http://51.222.26.28/api/leads/apply-pilot \
  -H "Content-Type: application/json" \
  -d '{
    "is_labor_lawyer": "Sí",
    "monthly_consultations": "30–60",
    "name": "Test",
    "email": "test@test.com",
    "phone": "+573001234567",
    "scheduled_date": "2026-01-25",
    "scheduled_time": "10:00"
  }'
# {"success":true,"leadId":"...","lead_type":"Ideal"}
```

### 5. Verificar Horarios Disponibles
```bash
curl "http://51.222.26.28/api/consultants/[ID]/available-times?date=2026-01-25"
# {"availableTimes":[...], "totalAvailable":15}
```

---

## 📝 Comandos Útiles de Administración

### Servicios
```bash
# Ver estado de todos los servicios
sudo systemctl status mongod
sudo systemctl status stivenads-backend
sudo systemctl status nginx

# Reiniciar servicios
sudo systemctl restart mongod
sudo systemctl restart stivenads-backend
sudo systemctl restart nginx

# Ver logs en tiempo real
sudo journalctl -u mongod -f
sudo journalctl -u stivenads-backend -f
sudo journalctl -u nginx -f
```

### MongoDB
```bash
# Conectar
mongosh stivenads

# Backup
mongodump --db stivenads --out /backup/

# Restore
mongorestore --db stivenads /backup/stivenads/

# Ver colecciones
mongosh stivenads --eval "db.getCollectionNames()"

# Contar documentos
mongosh stivenads --eval "db.leads.countDocuments()"
```

### Backend
```bash
# Ver logs en tiempo real
sudo journalctl -u stivenads-backend -f

# Ver logs de errores
sudo journalctl -u stivenads-backend --priority=err

# Reiniciar después de cambios
sudo systemctl restart stivenads-backend
```

---

## 🌍 URLs de Acceso

- **Frontend:** http://51.222.26.28
- **API Base:** http://51.222.26.28/api
- **Health Check:** http://51.222.26.28/api/health
- **Consultants API:** http://51.222.26.28/api/consultants

---

## ✅ Checklist de Verificación

- [x] MongoDB instalado y funcionando
- [x] Base de datos `stivenads` creada
- [x] Consultor inicial insertado
- [x] Backend Node.js ejecutándose
- [x] Nginx configurado y activo
- [x] Frontend React construido y desplegado
- [x] Variables de entorno configuradas
- [x] Google Calendar API funcionando
- [x] Gmail SMTP configurado
- [x] Endpoints API respondiendo
- [x] Leads guardándose en MongoDB
- [x] Eventos creándose en Google Calendar
- [x] Emails enviándose correctamente

---

## 🚨 Próximos Pasos Opcionales

### SSL/HTTPS con Let's Encrypt
```bash
# Obtener certificado (requiere dominio apuntando a IP)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática ya está configurada
sudo systemctl list-timers | grep certbot
```

### Monitoreo
```bash
# Instalar herramientas de monitoreo
sudo apt install htop iotop

# Ver uso de recursos
htop
sudo iotop
```

### Backups Automáticos
```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-mongodb.sh

# Agregar a cron
sudo crontab -e
# 0 2 * * * /usr/local/bin/backup-mongodb.sh
```

---

## 📞 Soporte

Para problemas o consultas sobre la configuración del servidor, revisa:
- Logs de MongoDB: `sudo journalctl -u mongod -f`
- Logs del backend: `sudo journalctl -u stivenads-backend -f`
- Logs de Nginx: `sudo tail -f /var/log/nginx/error.log`

**Estado del Servidor:** ✅ Operacional y listo para producción
