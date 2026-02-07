# ✅ Checklist de Producción - Stivenads

## 🔧 Configuración del Servidor

### Sistema Operativo
- [ ] Ubuntu 20.04+ instalado
- [ ] Sistema actualizado: `sudo apt update && sudo apt upgrade -y`
- [ ] SSH configurado y asegurado
- [ ] Firewall habilitado: `sudo ufw enable`

### Dependencias
- [ ] Node.js 18+ instalado
- [ ] npm 8+ instalado
- [ ] MongoDB 5+ instalado/accesible
- [ ] Nginx instalado (opcional pero recomendado)
- [ ] PM2 instalado: `sudo npm install -g pm2`

---

## 🚀 Deployment

### Backend
- [ ] Variables de entorno configuradas en `backend/.env`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (o puerto configurado)
- [ ] `FRONTEND_URL=https://stivenads.com`
- [ ] Credenciales de Google Calendar completadas
- [ ] Credenciales de Email configuradas
- [ ] MongoDB URI correcta
- [ ] Dependencias instaladas: `npm ci`
- [ ] Backend corriendo: `npm start` o `pm2 start`

### Frontend
- [ ] Build completado: `npm run build`
- [ ] Archivos en `frontend/dist/`
- [ ] `VITE_API_BASE_URL=https://stivenads.com/api` configurado
- [ ] Estáticos servidos por Nginx o servidor estático

---

## 🔐 Seguridad

### SSL/TLS
- [ ] Certificado SSL válido (Let's Encrypt)
- [ ] HTTPS redirigido automáticamente
- [ ] Score SSL A+ o mejor en https://www.ssllabs.com/

### Headers de Seguridad
- [ ] HSTS habilitado
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection habilitado
- [ ] CORS correctamente configurado

### Credenciales
- [ ] Contraseñas fuertes en `.env`
- [ ] `.env` NO está en Git
- [ ] API keys rotadas regularmente
- [ ] MongoDB con autenticación
- [ ] Firewall restrictivo

### Permisos
- [ ] Archivos con permisos 644 (no 777)
- [ ] Directorios con permisos 755
- [ ] Usuario no-root ejecutando aplicación
- [ ] `/var/log` con permisos correctos

---

## 📊 Monitoreo y Logs

### Logs
- [ ] Logs de error accesibles en `/var/log/stivenads/`
- [ ] Rotación de logs configurada
- [ ] Nginx logging configurado
- [ ] MongoDB logging habilitado

### Monitoreo
- [ ] PM2 configurado para reinicio automático
- [ ] Healthchecks en lugar: `/api/health` ✅
- [ ] Uptime monitoring (Uptime Robot, Pingdom, etc.)
- [ ] Alertas de error configuradas
- [ ] Backup automático de base de datos

### Performance
- [ ] Frontend PageSpeed > 80
- [ ] Backend response time < 500ms
- [ ] Database queries optimizadas
- [ ] Caché implementado para assets estáticos

---

## 🗄️ Base de Datos

### MongoDB
- [ ] Instancia corriendo y accesible
- [ ] Autenticación habilitada
- [ ] Base de datos `stivenads-production` creada
- [ ] Usuarios con permisos limitados
- [ ] Backups diarios programados
- [ ] Restore plan probado

### Collections
- [ ] `leads` creada
- [ ] `bookings` creada
- [ ] `consultants` creada
- [ ] Índices creados para queries frecuentes
- [ ] TTL para datos temporales configurado

---

## 🧪 Testing

### Funcionalidad
- [ ] Formulario de aplicación envía correctamente
- [ ] Agendamiento funciona end-to-end
- [ ] Emails se envían correctamente
- [ ] Google Calendar se sincroniza
- [ ] Descalificación de leads funciona

### Integración
- [ ] Facebook Pixel funciona
- [ ] Eventos se registran en Facebook
- [ ] Analytics configurado
- [ ] Email delivery verificado

### API
- [ ] `/api/health` responde 200 OK
- [ ] `/api/leads` funciona
- [ ] `/api/booking` funciona
- [ ] CORS no bloquea requests
- [ ] Rate limiting funciona

---

## 🔗 DNS y Dominio

- [ ] Dominio apunta a servidor
- [ ] A record correcto
- [ ] MX records para email (si aplica)
- [ ] SPF, DKIM, DMARC configurados
- [ ] TTL apropiado
- [ ] Propagación DNS completa

---

## 📱 Responsive y UX

- [ ] Sitio responsive en mobile
- [ ] Formulario accesible
- [ ] Tiempo de carga < 3 segundos
- [ ] Sin errores en console
- [ ] Navegación fluida

---

## 🌐 SEO y Rastreo

- [ ] Meta tags correctos
- [ ] Sitemap.xml existe
- [ ] Robots.txt configurado
- [ ] Open Graph tags presentes
- [ ] Google Search Console verificado
- [ ] Google Analytics funcionando

---

## 📧 Email

- [ ] Servicio email configurado
- [ ] Credenciales correctas
- [ ] Emails de test enviados exitosamente
- [ ] Plantillas de email funcionan
- [ ] No-reply email configurado

---

## 🔄 Mantenimiento

### Actualizaciones
- [ ] Sistema operativo actualizado
- [ ] Node.js actualizado
- [ ] Dependencias npm auditadas
- [ ] MongoDB actualizado
- [ ] Nginx actualizado

### Backups
- [ ] Backup de base de datos diario
- [ ] Backup de código en Git
- [ ] Backup de .env en lugar seguro
- [ ] Restore probado mensualmente

---

## 📋 Documentación

- [ ] README.md actualizado
- [ ] DEPLOYMENT_GUIDE.md presente
- [ ] Comandos comunes documentados
- [ ] Troubleshooting guide creado
- [ ] Contact info para soporte

---

## 🎯 URLs de Verificación

Verifica estas URLs antes de dar por completo el deployment:

- [ ] `https://stivenads.com/` - Sitio principal carga
- [ ] `https://stivenads.com/api/health` - Backend responde
- [ ] `https://www.sslabs.com/ssltest/?d=stivenads.com` - SSL válido
- [ ] `https://pagespeed.web.dev/?url=https%3A%2F%2Fstivenads.com%2F` - Performance
- [ ] `https://search.google.com/search-console` - Indexación

---

## 🚨 Incidentes

### Si algo falla:

1. Revisar logs
   ```bash
   pm2 logs stivenads-backend
   tail -f /var/log/nginx/stivenads-error.log
   ```

2. Verificar servicios
   ```bash
   pm2 status
   mongosh
   curl http://localhost:3001/api/health
   ```

3. Rollback rápido
   ```bash
   # Si hay cambios recientes problemáticos
   git revert <commit>
   npm run build
   pm2 restart stivenads-backend
   ```

---

## ✅ Firma de Aprobación

**Verificado por:** _______________  
**Fecha:** _______________  
**Estado:** [ ] Aprobado | [ ] Necesita ajustes  

**Notas:**
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

**Última actualización:** Febrero 2026  
**Versión de producción:** 1.0  
**Sitio:** https://stivenads.com
