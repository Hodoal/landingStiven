# 🚀 Guía de Configuración Nginx + Certbot para Stivenads

## Descripción General

Esta guía te ayudará a configurar tu aplicación Stivenads para servirse en HTTPS usando Nginx como proxy inverso y Certbot para gestionar certificados SSL gratuitos de Let's Encrypt.

### Arquitectura

```
Internet (IP Pública: :443 HTTPS)
    ↓
Nginx (Proxy Inverso)
    ├─→ /api/* → Node.js Backend (localhost:3000)
    └─→ /* → Frontend Estático (dist/)
```

---

## 📋 Requisitos Previos

- **Sistema Operativo**: Ubuntu 22.04+, Debian 11+, CentOS 8+ o Fedora
- **Acceso**: Root o sudo
- **Dominio**: Debe estar configurado apuntando a la IP pública del servidor
- **Puertos**: 80 (HTTP) y 443 (HTTPS) deben estar abiertos en el firewall
- **Node.js**: Debe estar corriendo en puerto 3000

### Verificar requisitos

```bash
# Verificar Node.js
node --version

# Verificar que la app escucha en 3000
netstat -tlnp | grep 3000

# Verificar conectividad de DNS
nslookup ejemplo.com
```

---

## 🔧 Paso 1: Instalación de Dependencias del Sistema

Ejecuta el script de instalación:

```bash
chmod +x setup-nginx.sh
./setup-nginx.sh
```

Este script:
- ✅ Instala Python 3.6+ con venv
- ✅ Instala Augeas para el plugin de Nginx
- ✅ Instala Nginx
- ✅ Crea entorno virtual para Certbot
- ✅ Instala Certbot y el plugin de Nginx
- ✅ Inicia y habilita Nginx

### Instalación Manual (si prefieres)

**Para APT (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-dev python3-venv libaugeas-dev gcc nginx
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/local/bin/certbot
```

**Para DNF (Fedora/RHEL):**
```bash
sudo dnf install python3 python3-devel augeas-devel gcc nginx
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/local/bin/certbot
```

---

## ⚙️ Paso 2: Configurar Nginx para tu Dominio

```bash
chmod +x configure-nginx.sh
./configure-nginx.sh ejemplo.com
```

Esto:
- ✅ Crea configuración Nginx personalizada
- ✅ Configura proxy inverso para API
- ✅ Sirve frontend estático
- ✅ Redirecciona HTTP → HTTPS
- ✅ Recarga Nginx

### Verificar Configuración

```bash
# Probar sintaxis
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
tail -f /var/log/nginx/stivenads_access.log
```

---

## 🔐 Paso 3: Obtener Certificado SSL con Certbot

### Opción A: Instalación Automática (Recomendado)

Certbot configura Nginx automáticamente:

```bash
sudo certbot --nginx -d ejemplo.com -d www.ejemplo.com
```

Certbot te preguntará:
1. Email para notificaciones
2. Aceptar términos de servicio
3. Compartir email con EFF (opcional)
4. HTTPS obligatorio (elige sí para mayor seguridad)

### Opción B: Solo Obtener Certificado

Si prefieres configuración manual:

```bash
sudo certbot certonly --nginx -d ejemplo.com -d www.ejemplo.com
```

Los certificados se guardarán en:
```
/etc/letsencrypt/live/ejemplo.com/
├── cert.pem
├── chain.pem
├── fullchain.pem
└── privkey.pem
```

---

## 🔄 Paso 4: Configurar Renovación Automática

```bash
chmod +x setup-auto-renewal.sh
./setup-auto-renewal.sh
```

Esto:
- ✅ Prueba renovación (dry-run)
- ✅ Crea script de renovación
- ✅ Configura cron job automático
- ✅ Se ejecuta 2 veces al día (00:00 y 12:00)

### Verificar Renovación

```bash
# Ver certificados instalados
sudo certbot certificates

# Ver logs de renovación
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Ver crontab
sudo crontab -l | grep certbot
```

---

## 🧪 Pruebas de Verificación

### 1. Certificado SSL

```bash
# Verificar certificado
sudo certbot certificates

# Ver detalles del certificado
openssl x509 -in /etc/letsencrypt/live/ejemplo.com/cert.pem -text -noout

# Verificar fecha de expiración
sudo certbot certificates | grep -A5 "ejemplo.com"
```

### 2. Conectividad

```bash
# Probar HTTPS
curl -I https://ejemplo.com
curl -I https://www.ejemplo.com

# Ver headers de seguridad
curl -I https://ejemplo.com | grep -i "strict-transport-security"

# Probar API
curl -I https://ejemplo.com/api/health
```

### 3. Rendimiento

```bash
# Ver respuesta del servidor
curl -v https://ejemplo.com

# Probar configuración SSL
openssl s_client -connect ejemplo.com:443
```

### 4. Diagnosticar Problemas

```bash
# Ver logs de Nginx
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/stivenads_access.log

# Ver procesos
ps aux | grep -E "nginx|node"

# Ver puertos abiertos
sudo netstat -tlnp | grep -E "80|443|3000"

# Ver certificados activos
sudo certbot certificates
```

---

## 🛠️ Troubleshooting

### Error: "Connection refused" en /api/*

**Causa**: Node.js no está corriendo en puerto 3000

**Solución**:
```bash
# Iniciar la app
cd /home/ubuntu/landingStiven
npm start

# O en background
nohup npm start > app.log 2>&1 &

# Verificar
netstat -tlnp | grep 3000
```

### Error: "Certificate not found"

**Causa**: Certbot no pudo emitir el certificado

**Solución**:
```bash
# Verificar que puertos 80 y 443 estén abiertos
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Intentar nuevamente
sudo certbot --nginx -d ejemplo.com

# Ver logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Error: "Nginx configuration error"

**Solución**:
```bash
# Probar configuración
sudo nginx -t

# Ver errores específicos
sudo nginx -t 2>&1

# Recargar si hay cambios
sudo systemctl reload nginx
```

### Certificado Expirado

**Solución**:
```bash
# Renovar inmediatamente
sudo certbot renew --force-renewal

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 📊 Comandos Útiles

```bash
# Estado de Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl stop nginx
sudo systemctl start nginx

# Habilitar/Deshabilitar inicio automático
sudo systemctl enable nginx
sudo systemctl disable nginx

# Ver configuración activa
sudo nginx -T

# Ver certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Eliminar certificado (cuidado)
sudo certbot delete --cert-name ejemplo.com

# Ver cron jobs
sudo crontab -l

# Ver logs en tiempo real
sudo tail -f /var/log/nginx/stivenads_access.log
sudo tail -f /var/log/nginx/stivenads_error.log
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📁 Archivos de Configuración

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Configuración Nginx | `/etc/nginx/sites-available/stivenads` | Config del sitio |
| Certificados | `/etc/letsencrypt/live/ejemplo.com/` | Certs SSL |
| Logs Nginx | `/var/log/nginx/` | Access/error logs |
| Logs Certbot | `/var/log/letsencrypt/` | Renewal logs |

---

## 🔒 Seguridad

La configuración incluye:

- ✅ HTTPS obligatorio (redirige HTTP → HTTPS)
- ✅ TLS 1.2+ solamente
- ✅ Headers de seguridad (HSTS, X-Frame-Options, etc.)
- ✅ Protección contra acceso a archivos sensibles
- ✅ Buffering seguro para APIs
- ✅ Limits de tamaño de carga (50MB)

---

## 📞 Soporte

Para más información:
- Documentación Nginx: https://nginx.org/en/docs/
- Documentación Certbot: https://certbot.eff.org/docs/
- Let's Encrypt: https://letsencrypt.org/

---

**Última actualización**: Enero 2026
