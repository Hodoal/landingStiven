#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════════════════╗
# ║                   CONFIGURAR SSL CON LET'S ENCRYPT                            ║
# ║                   Para Stivenads en VPS                                       ║
# ╚════════════════════════════════════════════════════════════════════════════════╝

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 🔐 CONFIGURAR SSL - STIVENADS 🔐                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variables
DOMAIN="stivenads.com"
DOMAIN_WWW="www.stivenads.com"
EMAIL="stivenads25@gmail.com"

echo -e "${YELLOW}Configuración:${NC}"
echo "  Dominio: $DOMAIN"
echo "  Dominio alternativo: $DOMAIN_WWW"
echo "  Email: $EMAIL"
echo ""

# 1. Verificar que Nginx está instalado
echo -e "${BLUE}[1/5] Verificando Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✓${NC} Nginx está instalado"
else
    echo -e "${YELLOW}✗ Nginx no está instalado. Instálalo primero con: apt install nginx${NC}"
    exit 1
fi

# 2. Verificar que Certbot está instalado
echo ""
echo -e "${BLUE}[2/5] Verificando Certbot...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✓${NC} Certbot está instalado"
else
    echo "Instalando Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# 3. Obtener certificado
echo ""
echo -e "${BLUE}[3/5] Obteniendo certificado SSL...${NC}"
sudo certbot certonly --nginx \
  -d "$DOMAIN" \
  -d "$DOMAIN_WWW" \
  -m "$EMAIL" \
  --agree-tos \
  --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Certificado obtenido exitosamente"
else
    echo -e "${YELLOW}✗ Error al obtener certificado${NC}"
    exit 1
fi

# 4. Configurar Nginx con SSL
echo ""
echo -e "${BLUE}[4/5] Configurando Nginx con SSL...${NC}"

# Crear archivo de configuración
sudo tee /etc/nginx/sites-available/stivenads > /dev/null <<EOF
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name stivenads.com www.stivenads.com;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stivenads.com www.stivenads.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/stivenads.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stivenads.com/privkey.pem;
    
    # SSL Protocols
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/xml+rss;
    gzip_vary on;
    gzip_comp_level 6;

    # Logging
    access_log /var/log/nginx/stivenads-access.log;
    error_log /var/log/nginx/stivenads-error.log warn;

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        
        # Timeouts - Ampliados para operaciones de Google Calendar y Email
        proxy_connect_timeout 90s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Frontend Static Files
    location / {
        root /var/www/stivenads/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 365d;
            add_header Cache-Control "public, immutable";
        }
        
        # Don't cache HTML
        location ~* \\.html\$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Deny access to sensitive files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo -e "${GREEN}✓${NC} Configuración de Nginx creada"

# 5. Habilitar sitio y reiniciar Nginx
echo ""
echo -e "${BLUE}[5/5] Reiniciando Nginx...${NC}"

if [ ! -L /etc/nginx/sites-enabled/stivenads ]; then
    sudo ln -s /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/
fi

# Desabilitar sitio por defecto
sudo rm -f /etc/nginx/sites-enabled/default

# Probar configuración
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo -e "${GREEN}✓${NC} Nginx reiniciado exitosamente"
else
    echo -e "${YELLOW}✗ Error en configuración de Nginx${NC}"
    exit 1
fi

# Configurar renovación automática
echo ""
echo -e "${BLUE}Configurando renovación automática...${NC}"
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
echo -e "${GREEN}✓${NC} Renovación automática habilitada"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✨ SSL CONFIGURADO EXITOSAMENTE ✨                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Información del certificado:${NC}"
echo -e "  Path: ${GREEN}/etc/letsencrypt/live/$DOMAIN/${NC}"
echo -e "  Válido hasta: $(sudo certbot certificates 2>/dev/null | grep -A 1 "$DOMAIN" | tail -1 || echo 'Ver con: sudo certbot certificates')"
echo ""

echo -e "${YELLOW}Verificación:${NC}"
echo "  • Visita: https://$DOMAIN"
echo "  • Verifica el certificado en: https://www.sslabs.com/ssltest/?d=$DOMAIN"
echo ""

echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  • Ver certificados: ${BLUE}sudo certbot certificates${NC}"
echo "  • Renovar manualmente: ${BLUE}sudo certbot renew${NC}"
echo "  • Ver logs de renovación: ${BLUE}sudo tail -f /var/log/letsencrypt/letsencrypt.log${NC}"
echo ""
