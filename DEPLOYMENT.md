# Guía de Deployment (Producción)

## Deployment Frontend

### Opción 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Navegar al directorio frontend
cd frontend

# 3. Desplegar
vercel

# 4. Configurar variables de entorno en Vercel dashboard
VITE_API_URL=https://tu-backend.herokuapp.com
```

### Opción 2: Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Navegar al directorio frontend
cd frontend

# 3. Construir
npm run build

# 4. Desplegar
netlify deploy --prod --dir=dist
```

### Opción 3: GitHub Pages

```bash
# En vite.config.js, añade:
export default defineConfig({
  plugins: [react()],
  base: '/landing_stiven/'
})

# Luego:
npm run build
# Sube la carpeta dist a GitHub Pages
```

## Deployment Backend

### Opción 1: Heroku

```bash
# 1. Instalar Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Crear aplicación
heroku create stivenads-backend

# 4. Configurar variables de entorno
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set GOOGLE_CALENDAR_ID=your_calendar
heroku config:set GOOGLE_REFRESH_TOKEN=your_token
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_app_password

# 5. Desplegar
git push heroku main

# 6. Ver logs
heroku logs --tail
```

### Opción 2: Railway

```bash
# 1. Conectar repositorio
# 2. En Railway dashboard, crear nuevo proyecto
# 3. Conectar MongoDB (agregar plugin)
# 4. Configurar variables de entorno
# 5. Deploy automático desde git
```

### Opción 3: Render

```bash
# 1. Conectar repositorio en render.com
# 2. Crear nuevo "Web Service"
# 3. Configurar:
#    - Build Command: npm install
#    - Start Command: npm start
# 4. Añadir variables de entorno
# 5. Deploy
```

### Opción 4: AWS (EC2)

```bash
# 1. Crear instancia EC2
# 2. SSH a la instancia
ssh -i your-key.pem ec2-user@your-instance

# 3. Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 4. Instalar MongoDB
# Ver MONGODB_SETUP.md

# 5. Clonar repositorio
git clone your-repo
cd landing_stiven/backend

# 6. Instalar dependencias
npm install

# 7. Crear .env
nano .env
# Paste tus variables

# 8. Usar PM2 para mantener el proceso vivo
npm install -g pm2
pm2 start server.js --name "stivenads-backend"
pm2 startup
pm2 save

# 9. Configurar Nginx como reverse proxy
sudo yum install nginx
# Configurar nginx.conf para proxiar a http://localhost:3001
```

## Checklist Pre-Deployment

- [ ] Variables de entorno configuradas correctamente
- [ ] Base de datos en producción creada y conectada
- [ ] Google Calendar API configurada
- [ ] Email service verificado
- [ ] Frontend apunta al backend correcto
- [ ] CORS configurado para dominio de producción
- [ ] Certificado SSL/HTTPS habilitado
- [ ] Backups de base de datos configurados
- [ ] Monitoreo activado

## Variables de Entorno Producción

```env
# Backend
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stivenads

# Google Calendar
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
GOOGLE_CALENDAR_ID=prod@gmail.com
GOOGLE_REFRESH_TOKEN=prod_refresh_token

# Email
EMAIL_USER=noreply@stivenads.com
EMAIL_PASSWORD=app_password
EMAIL_FROM=noreply@stivenads.com

# URLs
FRONTEND_URL=https://stivenads.com

# Frontend
VITE_API_URL=https://api.stivenads.com
```

## SSL/HTTPS

### Con Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --nginx -d stivenads.com

# Renovación automática
sudo systemctl enable certbot.timer
```

### Con Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name stivenads.com;

    ssl_certificate /etc/letsencrypt/live/stivenads.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stivenads.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name stivenads.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoreo en Producción

### PM2

```bash
# Ver estado de procesos
pm2 status

# Ver logs
pm2 logs

# Monitoreo en tiempo real
pm2 monit
```

### New Relic

```bash
npm install newrelic

# En server.js (primera línea)
require('newrelic');
```

### Datadog

Ver documentación de Datadog para integración

## Performance

### Frontend

```bash
# Analizar bundle
npm install -D vite-plugin-visualizer
```

### Backend

```bash
# Usar compression
npm install compression

# En server.js
const compression = require('compression');
app.use(compression());
```

## Backup Automático

### MongoDB Atlas

Habilitado por defecto en el plan M10+

### Manual con cron

```bash
# Script backup-mongo.sh
#!/bin/bash
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d_%H%M%S)

# Añadir a crontab
0 2 * * * /home/user/backup-mongo.sh
```

## Troubleshooting

### Backend no responde
```bash
# Verificar logs
heroku logs --tail
# o
pm2 logs

# Reiniciar
pm2 restart stivenads-backend
```

### Database connection error
- Verificar string de conexión
- Verificar IP whitelist en MongoDB Atlas
- Verificar credenciales

### Emails no envían
- Verificar EMAIL_PASSWORD (debe ser app password, no contraseña regular)
- Verificar que EMAIL_USER esté permitido

## Escala y Performance

### Carga inicial de datos
```bash
# Crear índices en MongoDB
db.bookings.createIndex({ date: 1 })
db.bookings.createIndex({ email: 1 })
```

### CDN para Frontend
- Vercel incluye CDN automático
- Netlify incluye CDN automático
- Configurable en AWS CloudFront

## Roadmap de Optimizaciones

1. Implementar caching con Redis
2. Agregar rate limiting
3. Optimizar queries de base de datos
4. Implementar lazy loading en frontend
5. Agregar service workers para offline
6. Implementar analytics
