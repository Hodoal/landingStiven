#!/bin/bash

# Script para configurar Nginx con dominio específico
# Uso: ./configure-nginx.sh example.com

if [ -z "$1" ]; then
    echo "❌ Debes proporcionar tu dominio"
    echo "Uso: ./configure-nginx.sh ejemplo.com"
    exit 1
fi

DOMAIN=$1
DOMAIN_WITHOUT_WWW=$(echo $DOMAIN | sed 's/^www\.//')

echo "================================"
echo "Configurando Nginx para: $DOMAIN_WITHOUT_WWW"
echo "================================"
echo ""

# Crear el archivo de configuración de Nginx
echo "[1] Creando configuración de Nginx..."

# Crear archivo de configuración específico
sudo tee /etc/nginx/sites-available/stivenads > /dev/null <<'EOF'
# Configuración Nginx para Stivenads

upstream nodejs_backend {
    server localhost:3000;
    keepalive 64;
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    
    server_name DOMAIN_VAR www.DOMAIN_VAR;
    
    # Permitir verificación de Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirigir todo lo demás a HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name DOMAIN_VAR www.DOMAIN_VAR;
    
    # Certificados SSL (serán agregados por certbot)
    ssl_certificate /etc/letsencrypt/live/DOMAIN_VAR/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_VAR/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Configuración SSL optimizada
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:20m;
    ssl_session_timeout 20m;
    ssl_session_tickets off;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Logs
    access_log /var/log/nginx/stivenads_access.log;
    error_log /var/log/nginx/stivenads_error.log;
    
    # Límites y timeouts
    client_max_body_size 50M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;
    
    # Frontend estático
    location / {
        root /home/ubuntu/landingStiven/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_cache_bypass $http_upgrade;
        
        # Buffering para responses grandes
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Health check
    location /health {
        proxy_pass http://nodejs_backend;
        proxy_set_header Host $host;
        access_log off;
    }
    
    # Bloquear acceso a archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Bloquear acceso a rutas específicas
    location ~ ^/(admin|wp-admin|wp-login\.php) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Reemplazar el dominio en el archivo
sudo sed -i "s/DOMAIN_VAR/$DOMAIN_WITHOUT_WWW/g" /etc/nginx/sites-available/stivenads

echo "[2] Habilitando sitio en Nginx..."
sudo ln -sf /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/stivenads

# Remover configuración por defecto si existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "[3] Removiendo configuración por defecto..."
    sudo rm /etc/nginx/sites-enabled/default
fi

echo "[4] Probando configuración de Nginx..."
if sudo nginx -t; then
    echo "✅ Configuración válida"
else
    echo "❌ Error en configuración"
    exit 1
fi

echo "[5] Recargando Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx configurado exitosamente!"
echo ""
echo "📝 Configuración creada en: /etc/nginx/sites-available/stivenads"
echo ""
echo "🔐 Próximo paso - Instalar certificado SSL:"
echo ""
echo "   sudo certbot --nginx -d $DOMAIN_WITHOUT_WWW -d www.$DOMAIN_WITHOUT_WWW"
echo ""
echo "O solo obtener certificado (sin cambios automáticos):"
echo ""
echo "   sudo certbot certonly --nginx -d $DOMAIN_WITHOUT_WWW -d www.$DOMAIN_WITHOUT_WWW"
echo ""
