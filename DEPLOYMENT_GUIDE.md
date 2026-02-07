# 📦 Guía de Deployment a Producción - Stivenads

## 🚀 Opción 1: Despliegue Local/VPS Directo

### Paso 1: Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB (si no está en la nube)
sudo apt install -y mongodb

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

### Paso 2: Configurar variables de entorno

```bash
cd /home/ubuntu/landingStiven/backend

# Editar configuración
nano .env

# Cambiar a producción
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/stivenads-production
FRONTEND_URL=https://stivenads.com
```

### Paso 3: Ejecutar script de deploy

```bash
cd /home/ubuntu/landingStiven

# Ejecutar script
./scripts/deploy.sh

# O manualmente:
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npm start
```

### Paso 4: Usar PM2 para mantener el servidor activo

```bash
cd /home/ubuntu/landingStiven/backend

# Iniciar con PM2
pm2 start npm --name "stivenads-backend" -- start

# Guardar configuración
pm2 save

# Crear arranque automático al iniciar servidor
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Paso 5: Configurar Nginx como reverse proxy

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/stivenads

# Agregar:
server {
    listen 80;
    server_name stivenads.com www.stivenads.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stivenads.com www.stivenads.com;
    
    # SSL (con certbot)
    ssl_certificate /etc/letsencrypt/live/stivenads.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stivenads.com/privkey.pem;
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend
    location / {
        root /home/ubuntu/landingStiven/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 6: SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --nginx -d stivenads.com -d www.stivenads.com

# Renovación automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🐳 Opción 2: Despliegue con Docker

### Paso 1: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Paso 2: Crear archivo .env.production

```bash
cd /home/ubuntu/landingStiven

cat > .env.production << EOF
FRONTEND_URL=https://stivenads.com
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALENDAR_ID=stivenads25@gmail.com
GOOGLE_REDIRECT_URI=https://stivenads.com/api/calendar/auth/callback
EMAIL_USER=stivenads25@gmail.com
EMAIL_PASSWORD=tu_app_password
GOOGLE_REFRESH_TOKEN=tu_refresh_token
MONGODB_PASSWORD=cambiar_contraseña_segura
EOF
```

### Paso 3: Construir y ejecutar contenedores

```bash
# Construir imágenes
docker-compose build

# Ejecutar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Paso 4: Verificar servicios

```bash
# Ver contenedores
docker ps

# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:5173
```

---

## ☁️ Opción 3: Despliegue en Vercel (Recomendado)

### Paso 1: Frontend a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Configurar variables de entorno en Vercel:**
- `VITE_API_BASE_URL=https://api.stivenads.com/api`

### Paso 2: Backend a Railway o Render

#### Con Railway:

```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up --prod
```

#### Con Render:

1. Conectar repositorio GitHub
2. Crear nuevo servicio Web
3. Configurar variables de entorno
4. Deploy automático

---

## 🔍 Verificación Post-Deploy

### Checklist de Producción

```bash
# 1. Backend activo
curl https://stivenads.com/api/health

# 2. Base de datos conectada
# Verificar en logs de backend

# 3. Frontend cargando
curl https://stivenads.com

# 4. Formularios funcionando
# Probar manualmente en sitio

# 5. SSL válido
# https://www.ssllabs.com/ssltest/

# 6. Performance
# https://pagespeed.web.dev/

# 7. Monitoreo
# Configurar en backend/logs
```

### Monitoreo Continuo

```bash
# Ver logs del backend
pm2 logs stivenads-backend

# O con Docker
docker-compose logs -f backend

# Estadísticas del sistema
pm2 monit
```

---

## 🚨 Troubleshooting

### Error: "Connection refused"
```bash
# Verificar si backend está corriendo
ps aux | grep node

# Verificar puerto
lsof -i :3001

# Ver logs
pm2 logs stivenads-backend
```

### Error: "CORS"
```bash
# Backend/.env debe tener:
FRONTEND_URL=https://stivenads.com

# Reiniciar
pm2 restart stivenads-backend
```

### Error: "Database connection failed"
```bash
# Verificar MongoDB
sudo systemctl status mongodb

# Verificar URI en .env
cat backend/.env | grep MONGODB
```

---

## 📊 Monitoreo y Logs

### PM2
```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs

# Monitoreo en tiempo real
pm2 monit

# Guardar config
pm2 save
```

### MongoDB
```bash
# Conectar a DB
mongosh

# Ver bases de datos
show dbs

# Seleccionar DB
use stivenads-production

# Ver colecciones
show collections

# Ver documentos
db.leads.find().limit(5)
```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] HTTPS/SSL habilitado
- [ ] Contraseñas fuertes en `.env`
- [ ] MongoDB con autenticación
- [ ] Firewall configurado
- [ ] Backups automáticos
- [ ] Monitoreo activo
- [ ] Rate limiting en API
- [ ] CORS restringido
- [ ] Headers de seguridad

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs: `pm2 logs` o `docker-compose logs`
2. Verificar variables de entorno: `cat .env`
3. Verificar conectividad: `curl http://localhost:3001/api/health`
4. Revisar base de datos: `mongosh`

**Sitio web:** https://stivenads.com  
**Email:** stivenads25@gmail.com  
**Soporte:** [Tu canal de soporte]
