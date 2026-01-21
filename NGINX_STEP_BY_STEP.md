# ✅ Checklist Paso a Paso - Nginx + Certbot

## 🚀 Antes de Comenzar

- [ ] Acceder a servidor por SSH
- [ ] Verificar que eres usuario `ubuntu` (o con sudo access)
- [ ] Navegar a: `cd /home/ubuntu/landingStiven`
- [ ] Listar archivos: `ls -la setup-nginx.sh configure-nginx.sh`

### Verificaciones Previas

```bash
# Verificar conectividad DNS
nslookup tu-dominio.com
# Debe mostrar tu IP pública

# Abrir puertos (si usas UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# Verificar Node.js
node --version
npm --version
```

---

## 📋 PASO 1: Instalación de Dependencias

### Ejecutar Script

```bash
# Navegar al directorio
cd /home/ubuntu/landingStiven

# Hacer ejecutables los scripts
chmod +x *.sh

# Ejecutar instalación
./setup-nginx.sh
```

### Qué verás:
```
================================
Nginx + Certbot Setup
================================

[1] Actualizando sistema...
[2] Instalando dependencias del sistema...
[3] Removiendo versiones anteriores de certbot...
[4] Creando entorno virtual para Certbot...
[5] Instalando Certbot y plugin de Nginx...
[6] Creando symlink para certbot...
[7] Iniciar servicio Nginx...

✅ Instalación completada!
```

### Validación
```bash
# Verificar Nginx
sudo systemctl status nginx

# Verificar Certbot
certbot --version

# Ver que Nginx escucha en puerto 80
sudo netstat -tlnp | grep :80
```

- [ ] Script ejecutado sin errores
- [ ] Nginx corriendo: `sudo systemctl status nginx` (estado: `active`)
- [ ] Certbot instalado: `certbot --version`
- [ ] Puerto 80 escuchando

---

## ⚙️ PASO 2: Configurar Nginx

### Ejecutar Script

```bash
./configure-nginx.sh tu-dominio.com
```

**Reemplaza `tu-dominio.com`** con tu dominio real, ej:
- `stivenads.com`
- `misite.co`
- `ejemplo.com.ar`

### Qué verás:
```
================================
Configurando Nginx para: ejemplo.com
================================

[1] Creando configuración de Nginx...
[2] Habilitando sitio en Nginx...
[3] Removiendo configuración por defecto...
[4] Probando configuración de Nginx...
✅ Configuración válida
[5] Recargando Nginx...

✅ Nginx configurado exitosamente!

🔐 Próximo paso - Instalar certificado SSL:
   sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Validación
```bash
# Probar configuración
sudo nginx -t

# Ver que Nginx recargó
sudo systemctl status nginx | grep Active

# Ver configuración creada
sudo cat /etc/nginx/sites-available/stivenads | head -20
```

- [ ] Script ejecutado sin errores
- [ ] Mensaje: "Configuración válida"
- [ ] Nginx recargado
- [ ] Archivo de config existe: `/etc/nginx/sites-available/stivenads`

---

## 🔐 PASO 3: Obtener Certificado SSL

**Importante:** Asegúrate que el dominio apunta a tu IP pública.

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Preguntas de Certbot:

**1. Email:**
```
Enter email address (used for urgent renewal and security notices): tu-email@example.com
```
✍️ Ingresa tu email real

**2. Términos de servicio:**
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf. You must
agree in order to register with the Let's Encrypt ACME server. Do you agree?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o:
```
⌨️ Escribe: `Y` y presiona Enter

**3. Newsletter de EFF (opcional):**
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o:
```
⌨️ Escribe: `Y` o `N` (depende de ti) y presiona Enter

**4. HTTPS obligatorio:**
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP
access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this
for new sites, unless you have a specific reason not to.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] and press enter.
```
⌨️ Escribe: `2` (para obligar HTTPS) y presiona Enter

### Qué verás después:
```
Congratulations! Your certificate has been successfully installed.

Successfully installed SSL certificate for tu-dominio.com and www.tu-dominio.com
```

### Validación
```bash
# Ver certificado instalado
sudo certbot certificates

# Probar HTTPS
curl -I https://tu-dominio.com

# Probar redirección
curl -I http://tu-dominio.com
# Debe redirigir a https://
```

- [ ] Certificado obtenido sin errores
- [ ] Mensaje: "Congratulations!"
- [ ] Certificado válido (90 días)
- [ ] `curl -I https://tu-dominio.com` responde 200/404 (no error de certificado)

---

## 🔄 PASO 4: Configurar Renovación Automática

```bash
./setup-auto-renewal.sh
```

### Qué verás:
```
================================
Configurando Renovación Automática de Certificados SSL
================================

[1] Verificando que Certbot esté instalado...
[2] Probando renovación (dry-run)...
[3] Agregando entrada a crontab...
[4] Agregando tarea a crontab...
✅ Tarea agregada: Renovación automática dos veces al día
[5] Verificando certificados instalados...

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

✅ Renovación automática configurada!

📅 Programación: Cada día a las 00:00 y 12:00
```

### Validación
```bash
# Ver certificados
sudo certbot certificates

# Ver cron job
sudo crontab -l | grep certbot

# Probar renovación (sin hacer cambios)
sudo certbot renew --dry-run
```

- [ ] Script ejecutado sin errores
- [ ] Cron job agregado: `sudo crontab -l`
- [ ] Renovación probada con dry-run

---

## ✅ PASO 5: Validación Completa

```bash
./validate-setup.sh
```

### Qué verás:
```
================================
Validación de Nginx + Certbot
================================

[1] Verificando Nginx...
✅ Nginx instalado
✅ Nginx está corriendo
✅ Configuración de Nginx válida

[2] Verificando Certbot...
✅ Certbot instalado
✅ Certbot ejecutable encontrado

[3] Verificando certificados SSL...
✅ Certificados instalados: 1

[4] Verificando puertos...
✅ Puerto 80 escuchando
✅ Puerto 443 escuchando
✅ Puerto 3000 escuchando (Node.js)

[5] Verificando archivos...
✅ Configuración de sitio existe
✅ Sitio está habilitado
✅ Script de renovación automática existe

[6] Verificando cron jobs...
✅ Renovación automática configurada en cron

[7] Verificando frontend...
✅ Frontend compilado existe

[8] Verificando logs...
✅ Log de acceso de Nginx existe
✅ Log de Certbot existe

================================
📊 Resumen de Validación
================================

🎉 ¡Todo está funcionando correctamente!
```

- [ ] Todos los items marcados con ✅
- [ ] Mensaje final: "¡Todo está funcionando correctamente!"

---

## 🧪 Pruebas Manuales

### Probar HTTPS
```bash
# Debe mostrar: HTTP/1.1 200 OK (o 404 si frontend no existe)
curl -I https://tu-dominio.com

# Ver certificado
curl -I https://tu-dominio.com 2>&1 | grep -i certificate

# Acceder desde navegador
# Abre: https://tu-dominio.com
# Debe ver: 🔒 candado verde en URL
```

### Probar API
```bash
# Si tu API tiene endpoint /api/health
curl https://tu-dominio.com/api/health

# Debe responder con JSON o estado
```

### Ver Logs
```bash
# Logs de acceso en tiempo real
sudo tail -f /var/log/nginx/stivenads_access.log

# Ver errores (en otra terminal)
sudo tail -f /var/log/nginx/stivenads_error.log
```

- [ ] HTTPS accesible desde navegador
- [ ] Certificado válido (🔒 en URL)
- [ ] API responde correctamente
- [ ] Logs sin errores críticos

---

## 🎉 ¡Felicidades!

Si completaste todas las verificaciones:

✅ Nginx instalado y corriendo
✅ Certificado SSL válido
✅ HTTPS activado
✅ Renovación automática configurada
✅ Todo validado

**Tu aplicación está segura y accesible en:** `https://tu-dominio.com`

---

## 📞 Si Algo Falla

### Problema: "Certificate not found"
```bash
# Verificar DNS
nslookup tu-dominio.com
# Debe mostrar tu IP pública

# Si DNS está bien, intentar nuevamente
sudo certbot --nginx -d tu-dominio.com
```

### Problema: "502 Bad Gateway"
```bash
# Node.js no está corriendo
npm start

# En otra terminal, verificar
netstat -tlnp | grep 3000
```

### Problema: "Connection refused"
```bash
# Puertos no abiertos
sudo ufw status

# Abrir puertos
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Problema: Nginx no inicia
```bash
# Ver error
sudo nginx -t

# Ver logs detallados
sudo systemctl status nginx
sudo tail -50 /var/log/nginx/error.log
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- [QUICK_START_NGINX.md](QUICK_START_NGINX.md) - Guía rápida
- [NGINX_CERTBOT_SETUP.md](NGINX_CERTBOT_SETUP.md) - Guía completa
- [NGINX_COMMANDS_REFERENCE.md](NGINX_COMMANDS_REFERENCE.md) - Referencia de comandos

---

**Última actualización**: Enero 21, 2026
