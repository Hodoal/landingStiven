# ⚡ Inicio Rápido: Nginx + Certbot para IP Pública

## 🚀 Resumen de 4 Pasos

### Paso 1: Instalar Dependencias (5-10 minutos)
```bash
cd /home/ubuntu/landingStiven
./setup-nginx.sh
```

**Qué hace:**
- Instala Python, Nginx, Certbot
- Crea entorno virtual
- Inicia Nginx

---

### Paso 2: Configurar Nginx (1 minuto)
```bash
./configure-nginx.sh tu-dominio.com
```

Reemplaza `tu-dominio.com` con tu dominio real (ej: `stivenads.com`)

**Qué hace:**
- Crea configuración para proxy inverso
- Configura redirección HTTP → HTTPS
- Activa el sitio en Nginx

---

### Paso 3: Obtener Certificado SSL (2-5 minutos)
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Responde a las preguntas:
- Email para notificaciones (ingresa tu email)
- Términos de servicio (presiona 'a' para aceptar)
- EFF newsletter (opcional, presiona 'n' o 'y')
- Obligar HTTPS (presiona '1' o '2' para sí)

**Qué hace:**
- Obtiene certificado SSL gratuito
- Configura Nginx automáticamente
- Recarga Nginx

---

### Paso 4: Configurar Renovación Automática (1 minuto)
```bash
./setup-auto-renewal.sh
```

**Qué hace:**
- Prueba renovación automática
- Configura cron para renovar diariamente

---

## ✅ Verificación

Una vez completado, verifica que todo funcione:

```bash
# Ver certificado
sudo certbot certificates

# Probar HTTPS
curl -I https://tu-dominio.com

# Ver que API responde
curl https://tu-dominio.com/api/health

# Ver logs
sudo tail -f /var/log/nginx/stivenads_access.log
```

---

## ⚠️ Verificaciones Previas

**Antes de ejecutar, asegúrate de:**

1. ✅ Tu dominio apunta a la IP pública del servidor
   ```bash
   nslookup tu-dominio.com
   # Debe mostrar tu IP pública
   ```

2. ✅ Puertos 80 y 443 están abiertos
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw status
   ```

3. ✅ Node.js corre en puerto 3000
   ```bash
   # Iniciar la app
   cd /home/ubuntu/landingStiven
   npm start
   
   # En otra terminal verificar
   netstat -tlnp | grep 3000
   ```

---

## 🔧 Si Algo Falla

```bash
# Ver errores de Nginx
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log

# Ver errores de Certbot
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver configuración de Nginx
sudo cat /etc/nginx/sites-enabled/stivenads
```

---

## 📞 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Port 80 already in use" | `sudo lsof -i :80` para ver qué usa el puerto |
| "Connection refused" (API) | Asegúrate que Node.js corre con `npm start` |
| "Certificate not found" | Verifica que el dominio DNS esté configurado |
| "Nginx not found" | Ejecuta primero `./setup-nginx.sh` |

---

Para más detalles, ver: [NGINX_CERTBOT_SETUP.md](NGINX_CERTBOT_SETUP.md)
