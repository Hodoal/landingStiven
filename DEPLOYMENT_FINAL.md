# 🚀 PRODUCCIÓN - INSTRUCCIONES FINALES

## 📝 SITUACIÓN ACTUAL

✅ **App completamente lista para producción**
- Frontend compilado (221.74 kB gzipped)
- Backend corriendo en puerto 5001
- MongoDB conectado y operativo
- Todas las credenciales configuradas
- Build listo: `/tmp/stivenads-production.tar.gz` (1.5 MB)

⚠️ **PENDIENTE: Token de Google Calendar**
- Estado: Revocado
- Impacto: Sistema funcionará en modo mock
- Solución: Ejecutar script para obtener token nuevo

---

## 🎯 PRÓXIMO PASO: OBTENER TOKEN NUEVO

### Opción 1: Script Interactivo (Recomendado)

```bash
bash /home/ubuntu/landingStiven/get-new-token.sh
```

**Qué hace:**
1. Muestra URL de autorización
2. Te pide que pegues el código de autorización
3. Intercambia código por refresh token
4. Actualiza archivos `.env` automáticamente
5. Reinicia API

---

## 📲 PROCESO MANUAL (Si el script no funciona)

### 1. Obtén el código de autorización

Abre esta URL en tu navegador:
```
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=526238973930-5jlsbfrfkeirmbpbs5bctqlqjrtes971.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fstivenads.com%2Fapi%2Fcalendar%2Fauth%2Fcallback
```

Luego:
- Haz click en "Allow"
- Se redirige a: `https://stivenads.com/api/calendar/auth/callback?code=XXXX...`
- **Copia el valor después de `code=`**

### 2. Intercambia código por token

```bash
REFRESH_TOKEN=$(node -e "
require('dotenv').config({ path: '/home/ubuntu/landingStiven/api/.env' });
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

(async () => {
  try {
    const { tokens } = await oauth2Client.getToken('PEGA_TU_CODIGO_AQUI');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
")
echo $REFRESH_TOKEN
```

### 3. Actualiza archivos .env

```bash
# Actualizar archivo api/.env
sed -i "s/^GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN/" /home/ubuntu/landingStiven/api/.env

# Actualizar archivo backend/.env
sed -i "s/^GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN/" /home/ubuntu/landingStiven/backend/.env

# Verificar que se actualizó
echo "Token en api/.env:"
grep GOOGLE_REFRESH_TOKEN /home/ubuntu/landingStiven/api/.env
echo "Token en backend/.env:"
grep GOOGLE_REFRESH_TOKEN /home/ubuntu/landingStiven/backend/.env
```

### 4. Reinicia API

```bash
pkill -f "node api/index.js" || true
sleep 2
cd /home/ubuntu/landingStiven && node api/index.js > /tmp/api-token.log 2>&1 &
sleep 5

# Verifica que el token es válido
curl -s http://localhost:5001/api/calendar/token/status | grep -i "isValid"
```

---

## 🚀 OPCIONES DE DEPLOYMENT

### Opción A: Vercel (Cloud - Recomendado)

```bash
cd /home/ubuntu/landingStiven
vercel --prod
```

**Ventajas:**
- Sin configuración de servidor
- SSL automático
- Auto-scaling
- Backups automáticos

**Configuración necesaria:**
```env
# En Vercel dashboard - Environment Variables:
MONGODB_URI=tu_mongodb_url
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=... (el nuevo)
GOOGLE_CALENDAR_ID=...
GOOGLE_REDIRECT_URI=https://stivenads.com/api/calendar/auth/callback
```

### Opción B: VPS Manual

```bash
# 1. En tu máquina local
scp -r /tmp/stivenads-production.tar.gz usuario@tu_vps:/home/stivenads/

# 2. En el VPS
ssh usuario@tu_vps

# 3. Descomprimir
cd /home/stivenads
tar -xzf stivenads-production.tar.gz

# 4. Instalar dependencias
npm install --production

# 5. Configurar .env
nano .env
# Actualizar:
# - MONGODB_URI (si es diferente)
# - GOOGLE_REFRESH_TOKEN (el nuevo)
# - NODE_ENV=production
# - PORT=5001 (o el puerto que uses)

# 6. Instalar PM2 (gestor de procesos)
npm install -g pm2

# 7. Iniciar con PM2
pm2 start api/index.js --name "stivenads"
pm2 startup
pm2 save

# 8. Configurar Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/stivenads
# Apuntar a localhost:5001

# 9. Habilitar SSL (Let's Encrypt)
sudo certbot certonly --nginx -d stivenads.com -d www.stivenads.com
```

### Opción C: Docker

```bash
# 1. Crear Dockerfile en raíz del proyecto
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN cd frontend && npm install && npm run build

EXPOSE 5001

CMD ["node", "api/index.js"]
EOF

# 2. Construir imagen
docker build -t stivenads:latest .

# 3. Ejecutar contenedor
docker run -d \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/stivenads-production \
  -e GOOGLE_REFRESH_TOKEN=tu_token_nuevo \
  --name stivenads \
  stivenads:latest
```

---

## ✅ CHECKLIST FINAL

- [ ] Token de Google Calendar renovado y actualizado
- [ ] Archivos .env verificados en todas las carpetas
- [ ] Build compilado y probado localmente
- [ ] MongoDB respaldado (backup)
- [ ] Dominio y DNS configurados
- [ ] SSL certificate obtenido (Let's Encrypt)
- [ ] Variables de entorno en servidor configuradas
- [ ] API respondiendo en servidor
- [ ] Frontend sirviéndose correctamente
- [ ] Test de form submission funcionando
- [ ] Admin dashboard accesible
- [ ] Monitoreo y alertas configuradas
- [ ] Plan de rollback documentado

---

## 🔍 VERIFICACIÓN POST-DEPLOY

```bash
# Health check
curl https://stivenads.com/api/health

# Token status
curl https://stivenads.com/api/calendar/token/status

# Database connection
curl https://stivenads.com/api/leads/admin/stats

# Frontend carga
curl https://stivenads.com | grep -i "meta\|pixel"
```

---

## 📞 EN CASO DE PROBLEMAS

### Token sigue revocado
1. Obtener nuevo token manualmente
2. Actualizar archivos .env
3. Restart API

### Database no conecta
1. Verificar MongoDB está corriendo: `systemctl status mongod`
2. Verificar MONGODB_URI en .env
3. Revisar logs: `tail -f /tmp/api-token.log`

### Form submission falla
1. Verificar MongoDB
2. Verificar API logs
3. Verificar CORS headers
4. Usar endpoint: POST /api/leads/apply-pilot

### Admin dashboard no carga
1. Verificar acceso: `curl http://localhost:5001/api/leads/admin/leads`
2. Verificar autenticación
3. Revisar base de datos: `mongo stivenads-production`

---

## 📊 MONITOREO

```bash
# Ver logs en tiempo real
tail -f /tmp/api-token.log

# Ver procesos
ps aux | grep node

# Ver puertos
netstat -tulpn | grep 5001

# Ver MongoDB
mongosh stivenads-production
> db.leads.count()
> db.bookings.count()
```

---

**🎉 ¡Ya estás listo para ir a producción!**

**Próximo paso:** Obtener token nuevo y hacer deploy.

