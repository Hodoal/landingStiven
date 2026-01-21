# 📖 Índice de Configuración Nginx + Certbot

## 📚 Documentos Principales

### 🚀 Para Comenzar
- **[QUICK_START_NGINX.md](QUICK_START_NGINX.md)** ⭐
  - Instrucciones rápidas de 4 pasos
  - Verificaciones previas
  - Troubleshooting básico
  - **COMIENZA AQUÍ**

### 📖 Guías Detalladas
- **[NGINX_CERTBOT_SETUP.md](NGINX_CERTBOT_SETUP.md)**
  - Guía completa paso a paso
  - Explicación de cada comando
  - Requisitos del sistema
  - Troubleshooting avanzado
  - Mejores prácticas de seguridad

- **[NGINX_ARCHITECTURE.md](NGINX_ARCHITECTURE.md)**
  - Diagrama de arquitectura
  - Flujo de requests
  - Ciclo de vida de certificados
  - Estructura de directorios
  - Capas de seguridad

### 📚 Referencia Rápida
- **[NGINX_COMMANDS_REFERENCE.md](NGINX_COMMANDS_REFERENCE.md)**
  - Comandos útiles organizados por categoría
  - Control de servicios
  - Gestión de certificados
  - Debugging y logs
  - Copy-paste ready

---

## 🛠️ Scripts de Automatización

### 1. Instalación Base
```bash
./setup-nginx.sh
```
**Qué hace:**
- Instala dependencias del sistema
- Instala Nginx
- Instala Certbot en entorno virtual
- Inicia servicios

**Duración:** 5-10 minutos

---

### 2. Configuración del Sitio
```bash
./configure-nginx.sh tu-dominio.com
```
**Qué hace:**
- Crea configuración de Nginx
- Configura proxy inverso
- Activa el sitio
- Recarga Nginx

**Duración:** 1 minuto

---

### 3. Certificado SSL
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```
**Qué hace:**
- Valida dominio
- Obtiene certificado gratuito
- Configura HTTPS automáticamente
- Recarga Nginx

**Duración:** 2-5 minutos

---

### 4. Renovación Automática
```bash
./setup-auto-renewal.sh
```
**Qué hace:**
- Configura cron job
- Prueba renovación
- Configura recargar Nginx post-renovación

**Duración:** 1 minuto

---

### 5. Validación
```bash
./validate-setup.sh
```
**Qué hace:**
- Verifica toda la instalación
- Reporte de estado
- Indicaciones de problemas

**Duración:** 1 minuto

---

## ✅ Checklist de Instalación

```
Preparación:
  ☐ Dominio configurado apuntando a IP pública
  ☐ Puertos 80 y 443 abiertos en firewall
  ☐ Node.js corriendo en puerto 3000
  ☐ Frontend compilado (npm run build)
  ☐ SSH acceso al servidor

Instalación:
  ☐ Ejecutar setup-nginx.sh
  ☐ Verificar que Nginx esté corriendo
  ☐ Verificar que certbot esté instalado
  ☐ Ejecutar configure-nginx.sh

SSL:
  ☐ Ejecutar certbot --nginx
  ☐ Ingresar email
  ☐ Aceptar términos
  ☐ Elegir obligar HTTPS

Automatización:
  ☐ Ejecutar setup-auto-renewal.sh
  ☐ Verificar cron job
  ☐ Ejecutar validate-setup.sh

Verificación:
  ☐ Acceder a https://tu-dominio.com
  ☐ Ver certificado válido (🔒)
  ☐ Probar API: https://tu-dominio.com/api/health
  ☐ Ver logs sin errores
  ☐ Certificado renovable: sudo certbot renew --dry-run
```

---

## 🔍 Verificaciones Rápidas

### ¿Todo está funcionando?
```bash
./validate-setup.sh
```

### Ver estado de Nginx
```bash
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/stivenads_error.log
```

### Ver certificados
```bash
sudo certbot certificates
```

### Probar HTTPS
```bash
curl -I https://tu-dominio.com
curl https://tu-dominio.com/api/health
```

### Ver logs en tiempo real
```bash
sudo tail -f /var/log/nginx/stivenads_access.log
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| `502 Bad Gateway` | Node.js no corre: `npm start` |
| `Connection refused` | Puertos no escuchando: `sudo netstat -tlnp` |
| `Certificate not found` | DNS no resuelve: `nslookup tu-dominio.com` |
| `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` | Nginx no cargó cert: `sudo nginx -t` |
| `Port 80 already in use` | Otro proceso usa puerto: `sudo lsof -i :80` |

Ver [NGINX_CERTBOT_SETUP.md](NGINX_CERTBOT_SETUP.md) para troubleshooting avanzado.

---

## 📋 Archivos de Configuración

| Archivo | Ubicación |
|---------|-----------|
| Config Nginx | `/etc/nginx/sites-available/stivenads` |
| Certificados | `/etc/letsencrypt/live/tu-dominio.com/` |
| Logs Nginx | `/var/log/nginx/` |
| Logs Certbot | `/var/log/letsencrypt/letsencrypt.log` |
| Cron Renewal | `sudo crontab -l` |

---

## 🔐 Seguridad

La configuración incluye automáticamente:

- ✅ HTTPS obligatorio (redirige HTTP)
- ✅ TLS 1.2+ solamente
- ✅ Headers de seguridad (HSTS, X-Frame-Options, etc.)
- ✅ Certificado válido 90 días (renovación automática)
- ✅ Protección contra acceso a archivos sensibles
- ✅ Proxy seguro con headers forwardeados

---

## 📞 Comandos de Emergencia

```bash
# Detener Nginx
sudo systemctl stop nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Recargar config sin desconectar
sudo systemctl reload nginx

# Renovar certificado inmediatamente
sudo certbot renew --force-renewal

# Ver qué proceso usa puerto 80
sudo lsof -i :80

# Kill a proceso Node.js
pkill -f "node api/index.js"
```

---

## 📞 Contacto y Soporte

- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot Docs**: https://certbot.eff.org/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Community**: https://community.letsencrypt.org/

---

## 🎯 Próximos Pasos (Opcional)

### Después de la configuración básica:

1. **Monitoreo**
   - Configurar alertas de certificados
   - Monitorear uptime
   - Analizar logs

2. **Optimización**
   - Configurar caching
   - Optimizar imágenes
   - Minificar CSS/JS

3. **Escalabilidad**
   - Load balancing
   - Múltiples servidores
   - CDN para assets estáticos

4. **Mantenimiento**
   - Rotación de logs
   - Backups automáticos
   - Updates del sistema

---

**Última actualización**: Enero 21, 2026

---

### 🚀 ¿Listo para comenzar?

**Paso 1:** Lee [QUICK_START_NGINX.md](QUICK_START_NGINX.md)
**Paso 2:** Ejecuta los scripts en orden
**Paso 3:** Valida con `./validate-setup.sh`
**Paso 4:** ¡Disfruta tu HTTPS!

---
