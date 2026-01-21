# 📚 Referencia de Comandos Nginx + Certbot

## Control de Nginx

```bash
# Estado
sudo systemctl status nginx
sudo systemctl is-active nginx

# Iniciar/Parar/Reiniciar
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# Habilitar al boot
sudo systemctl enable nginx
sudo systemctl disable nginx

# Verificar configuración
sudo nginx -t
sudo nginx -T    # Ver configuración completa

# Ver versión
nginx -v
nginx -V
```

---

## Control de Certbot

```bash
# Ver certificados instalados
sudo certbot certificates

# Renovar certificados
sudo certbot renew
sudo certbot renew --force-renewal    # Renovación forzada

# Probar renovación (sin cambiar nada)
sudo certbot renew --dry-run

# Obtener nuevo certificado
sudo certbot --nginx -d ejemplo.com

# Eliminar certificado
sudo certbot delete --cert-name ejemplo.com

# Ver logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Gestión de Configuración

```bash
# Ver configuración activa
sudo cat /etc/nginx/sites-enabled/stivenads

# Editar configuración
sudo nano /etc/nginx/sites-available/stivenads

# Listar sitios disponibles
ls -la /etc/nginx/sites-available/

# Listar sitios activos
ls -la /etc/nginx/sites-enabled/

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/

# Deshabilitar sitio
sudo rm /etc/nginx/sites-enabled/stivenads

# Recargar después de cambios
sudo systemctl reload nginx
```

---

## Verificación de Conectividad

```bash
# Probar HTTPS
curl -I https://ejemplo.com
curl -I https://www.ejemplo.com

# Probar API
curl https://ejemplo.com/api/health

# Ver headers de respuesta
curl -v https://ejemplo.com

# Probar conexión SSL
openssl s_client -connect ejemplo.com:443

# Ver certificado
openssl x509 -in /etc/letsencrypt/live/ejemplo.com/cert.pem -text -noout

# Verificar fecha de expiración
openssl x509 -in /etc/letsencrypt/live/ejemplo.com/cert.pem -noout -dates

# Probar desde línea de comandos remota
ssh -t usuario@servidor 'curl -I https://ejemplo.com'
```

---

## Puertos y Procesos

```bash
# Ver qué usa puerto 80
sudo lsof -i :80
sudo netstat -tlnp | grep :80

# Ver qué usa puerto 443
sudo lsof -i :443
sudo netstat -tlnp | grep :443

# Ver qué usa puerto 3000 (Node.js)
sudo lsof -i :3000
ps aux | grep node

# Ver todos los puertos escuchando
sudo netstat -tlnp
sudo ss -tlnp

# Killiar proceso
kill -9 <PID>
sudo kill -9 <PID>
```

---

## Logs y Debugging

```bash
# Logs de acceso en tiempo real
sudo tail -f /var/log/nginx/stivenads_access.log

# Logs de error en tiempo real
sudo tail -f /var/log/nginx/stivenads_error.log
sudo tail -f /var/log/nginx/error.log

# Ver últimas líneas
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# Búsqueda en logs
grep "404" /var/log/nginx/stivenads_access.log
grep "error" /var/log/nginx/stivenads_error.log

# Contar líneas
wc -l /var/log/nginx/stivenads_access.log

# Ver logs comprimidos
zcat /var/log/nginx/stivenads_access.log.*.gz

# Limpiar logs (cuidado)
sudo > /var/log/nginx/stivenads_access.log
sudo > /var/log/nginx/stivenads_error.log
```

---

## Certificados - Detalles

```bash
# Lista de certificados
sudo certbot certificates --show-only

# Info del certificado
openssl x509 -in /etc/letsencrypt/live/ejemplo.com/fullchain.pem -noout -text

# Verificar cadena de certificados
openssl s_client -connect ejemplo.com:443 -showcerts

# Validar certificado
openssl verify /etc/letsencrypt/live/ejemplo.com/fullchain.pem

# Días hasta expiración
sudo certbot certificates | grep -A2 "ejemplo.com"

# Renovar certificado específico
sudo certbot renew --cert-name ejemplo.com
```

---

## Cron Jobs

```bash
# Ver cron jobs del root
sudo crontab -l

# Editar cron jobs
sudo crontab -e

# Ver logs de cron
sudo tail -f /var/log/syslog | grep CRON
sudo journalctl -u cron -f

# Formato de cron para renovación:
# 0 0,12 * * * /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && /opt/certbot/bin/certbot renew -q --post-hook "systemctl reload nginx"
```

---

## Permisos

```bash
# Ver permisos
ls -la /etc/nginx/
ls -la /etc/letsencrypt/
ls -la /etc/nginx/sites-available/

# Cambiar propietario
sudo chown www-data:www-data /home/ubuntu/landingStiven/frontend/dist

# Cambiar permisos
sudo chmod 755 /home/ubuntu/landingStiven/frontend/dist
sudo chmod 644 /home/ubuntu/landingStiven/frontend/dist/*
```

---

## Backup y Restore

```bash
# Backup de configuración Nginx
sudo cp -r /etc/nginx /etc/nginx.backup.$(date +%Y%m%d)

# Backup de certificados
sudo cp -r /etc/letsencrypt /etc/letsencrypt.backup.$(date +%Y%m%d)

# Backup automático
# Agregar a crontab:
# 0 3 * * * tar -czf /home/backups/nginx-$(date +\%Y\%m\%d).tar.gz /etc/nginx /etc/letsencrypt

# Restaurar desde backup
sudo cp -r /etc/nginx.backup.20250121/* /etc/nginx/
sudo systemctl reload nginx
```

---

## Optimizaciones y Análisis

```bash
# Analizar rendimiento de Nginx
sudo apt install apache2-utils
ab -n 100 -c 10 https://ejemplo.com/

# Ver estadísticas de conexión
sudo ss -s
sudo netstat -s

# Monitor en tiempo real
watch -n 1 'netstat -tlnp | grep -E "80|443|3000"'

# Ver uso de recursos
top -p $(pgrep nginx)
ps aux | grep nginx
```

---

## Troubleshooting Rápido

```bash
# Problema: 502 Bad Gateway
# Causa: Node.js no está corriendo
npm start  # En /home/ubuntu/landingStiven

# Problema: Connection refused
# Causa: Puertos no escuchando
sudo netstat -tlnp | grep -E "80|443"

# Problema: Certificado no válido
# Causa: DNS no configurado
nslookup ejemplo.com

# Problema: Nginx no inicia
# Solución
sudo nginx -t  # Ver error
sudo systemctl status nginx  # Ver detalles

# Problema: Cron no ejecuta
# Verificar
sudo crontab -l
sudo cat /var/log/syslog | grep CRON
```

---

## Utilidades

```bash
# IP pública
curl -s https://api.ipify.org

# Verificar DNS
nslookup ejemplo.com
dig ejemplo.com
host ejemplo.com

# Verificar conectividad
ping ejemplo.com
traceroute ejemplo.com

# Verificar puertos
nc -zv ejemplo.com 443
telnet ejemplo.com 443

# Test de velocidad SSL
# Visita: https://www.ssllabs.com/ssltest/

# Verificar headers de seguridad
curl -I https://ejemplo.com | head -20
```

---

## Variables Útiles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `$host` | Nombre del host | ejemplo.com |
| `$server_name` | Nombre del servidor | ejemplo.com www.ejemplo.com |
| `$remote_addr` | IP del cliente | 192.168.1.1 |
| `$request_method` | Método HTTP | GET, POST, PUT |
| `$request_uri` | URI completo | /api/health?status=true |
| `$scheme` | Esquema (http/https) | https |
| `$http_x_forwarded_for` | IP real (proxy) | 192.168.1.1 |
| `$proxy_add_x_forwarded_for` | IP forwarding | 192.168.1.1, 10.0.0.1 |

---

**Última actualización**: Enero 2026
