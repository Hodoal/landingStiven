#!/bin/bash

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                 🚀 DEPLOYMENT VPS DIRECTO - STIVENADS 🚀                      ║
║                                                                                ║
║                         Resumen de los 7 pasos principales                    ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝


PASO 1️⃣  - PREPARAR SERVIDOR (5-10 minutos)
═════════════════════════════════════════════════════════════════════════════════

  Ejecuta como ROOT en tu servidor VPS:

    $ sudo ./scripts/setup-vps.sh

  Esto instala automáticamente:
    ✓ Node.js 18      ✓ MongoDB     ✓ Nginx     ✓ PM2     ✓ Certbot


PASO 2️⃣  - CLONAR Y CONFIGURAR (5 minutos)
═════════════════════════════════════════════════════════════════════════════════

  a) Clonar repositorio:
     
     $ sudo su - stivenads
     $ cd /var/www/stivenads
     $ git clone https://github.com/tuusuario/landingStiven.git .

  b) Instalar dependencias:
     
     $ cd backend && npm ci
     $ cd ../frontend && npm ci

  c) Configurar variables de entorno:
     
     $ exit
     $ sudo nano /var/www/stivenads/backend/.env
     
     (Copiar valores de tu configuración actual)


PASO 3️⃣  - COMPILAR FRONTEND (5-10 minutos)
═════════════════════════════════════════════════════════════════════════════════

  $ sudo su - stivenads
  $ cd /var/www/stivenads/frontend
  $ npm run build
  $ exit


PASO 4️⃣  - INICIAR BACKEND (1 minuto)
═════════════════════════════════════════════════════════════════════════════════

  Iniciar con PM2:
    
    $ cd /var/www/stivenads/backend
    $ pm2 start npm --name stivenads-backend -- start
    $ pm2 save
    $ pm2 startup systemd -u root --hp /root && pm2 save

  Verificar que está corriendo:
    
    $ pm2 status
    $ curl http://localhost:3001/api/health


PASO 5️⃣  - CONFIGURAR NGINX (3 minutos)
═════════════════════════════════════════════════════════════════════════════════

  a) Crear archivo de configuración:
     
     $ sudo nano /etc/nginx/sites-available/stivenads
     
     (Usar configuración de DEPLOYMENT_VPS_PASO_A_PASO.md)

  b) Habilitar y reiniciar:
     
     $ sudo ln -s /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/
     $ sudo rm -f /etc/nginx/sites-enabled/default
     $ sudo nginx -t
     $ sudo systemctl restart nginx

  c) Verificar:
     
     $ curl http://localhost


PASO 6️⃣  - CONFIGURAR SSL (5-10 minutos)
═════════════════════════════════════════════════════════════════════════════════

  Importante: Tu dominio debe apuntar al servidor antes

  Opción A - Script automático:
    
    $ sudo /var/www/stivenads/scripts/setup-ssl.sh

  Opción B - Manual:
    
    $ sudo certbot certonly --nginx -d stivenads.com -d www.stivenads.com


PASO 7️⃣  - VERIFICAR PRODUCCIÓN (5 minutos)
═════════════════════════════════════════════════════════════════════════════════

  Verificar que todo funciona:
    
    ✓ Sitio web:           https://stivenads.com
    ✓ API health:          https://stivenads.com/api/health
    ✓ SSL válido:          https://www.sslabs.com/ssltest/?d=stivenads.com
    ✓ Performance:         https://pagespeed.web.dev/
    ✓ Logs backend:        pm2 logs stivenads-backend
    ✓ Status servicios:    pm2 status


═════════════════════════════════════════════════════════════════════════════════

⏱️  TIEMPO TOTAL ESTIMADO: 30-45 minutos


📋 ARCHIVOS IMPORTANTES
═════════════════════════════════════════════════════════════════════════════════

  ✓ /var/www/stivenads/backend/.env
    Variables de entorno del backend

  ✓ /etc/nginx/sites-available/stivenads
    Configuración del reverse proxy

  ✓ /etc/letsencrypt/live/stivenads.com/
    Certificados SSL

  ✓ /var/log/nginx/stivenads-error.log
    Logs de errores de Nginx

  ✓ /var/log/stivenads/
    Logs de la aplicación


🔧 COMANDOS ÚTILES DESPUÉS DEL DEPLOY
═════════════════════════════════════════════════════════════════════════════════

  Ver estado:
    $ pm2 status
    $ pm2 logs stivenads-backend

  Reiniciar backend:
    $ pm2 restart stivenads-backend

  Detener backend:
    $ pm2 stop stivenads-backend

  Ver Nginx logs:
    $ sudo tail -f /var/log/nginx/stivenads-error.log

  Monitoreo en vivo:
    $ pm2 monit

  Actualizar código:
    $ cd /var/www/stivenads && git pull origin main
    $ cd frontend && npm ci && npm run build
    $ cd ../backend && pm2 restart stivenads-backend


🚨 SI ALGO FALLA
═════════════════════════════════════════════════════════════════════════════════

  Backend no responde:
    1. pm2 logs stivenads-backend
    2. sudo systemctl status mongodb
    3. pm2 restart stivenads-backend

  Nginx error:
    1. sudo nginx -t (verificar sintaxis)
    2. sudo systemctl restart nginx
    3. sudo tail -f /var/log/nginx/error.log

  Certificado SSL:
    1. sudo certbot certificates
    2. sudo certbot renew --dry-run


📚 DOCUMENTACIÓN COMPLETA
═════════════════════════════════════════════════════════════════════════════════

  Lee este archivo para todos los detalles:
  
    DEPLOYMENT_VPS_PASO_A_PASO.md  (Este mismo archivo con todos los comandos)


✨ ¡LISTO PARA PRODUCCIÓN!
═════════════════════════════════════════════════════════════════════════════════

  Ejecuta los 7 pasos y tu sitio Stivenads estará en producción.

  ¿Necesitas ayuda?
    - Revisa los logs: pm2 logs stivenads-backend
    - Verifica la configuración: cat /var/www/stivenads/backend/.env
    - Consulta la guía: DEPLOYMENT_GUIDE.md


═════════════════════════════════════════════════════════════════════════════════

EOF
