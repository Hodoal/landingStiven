#!/bin/bash

# Script de validación post-instalación

echo "================================"
echo "Validación de Nginx + Certbot"
echo "================================"
echo ""

ERRORS=0
WARNINGS=0

# Función para reportar estado
status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        ((ERRORS++))
    fi
}

warning() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

# Verificaciones
echo "[1] Verificando Nginx..."
command -v nginx &> /dev/null
status "Nginx instalado"

sudo systemctl is-active --quiet nginx
status "Nginx está corriendo"

sudo nginx -t 2>&1 | grep -q "successful"
status "Configuración de Nginx válida"

echo ""
echo "[2] Verificando Certbot..."
command -v certbot &> /dev/null
status "Certbot instalado"

test -f /opt/certbot/bin/certbot
status "Certbot ejecutable encontrado"

echo ""
echo "[3] Verificando certificados SSL..."
sudo certbot certificates 2>/dev/null | grep -q "Found"
if [ $? -eq 0 ]; then
    CERT_COUNT=$(sudo certbot certificates 2>/dev/null | grep "Certificate Name" | wc -l)
    echo "✅ Certificados instalados: $CERT_COUNT"
else
    warning "No hay certificados SSL instalados aún"
fi

echo ""
echo "[4] Verificando puertos..."
netstat -tlnp 2>/dev/null | grep -q ":80 "
status "Puerto 80 escuchando"

netstat -tlnp 2>/dev/null | grep -q ":443 "
status "Puerto 443 escuchando"

netstat -tlnp 2>/dev/null | grep -q ":3000 "
if [ $? -eq 0 ]; then
    echo "✅ Puerto 3000 escuchando (Node.js)"
else
    warning "Node.js no está corriendo en puerto 3000. Inicia con: npm start"
fi

echo ""
echo "[5] Verificando archivos..."
test -f /etc/nginx/sites-available/stivenads
status "Configuración de sitio existe"

test -f /etc/nginx/sites-enabled/stivenads
status "Sitio está habilitado"

test -f /usr/local/bin/certbot-renew.sh
if [ $? -eq 0 ]; then
    echo "✅ Script de renovación automática existe"
else
    warning "Script de renovación automática no encontrado"
fi

echo ""
echo "[6] Verificando cron jobs..."
sudo crontab -l 2>/dev/null | grep -q "certbot"
if [ $? -eq 0 ]; then
    echo "✅ Renovación automática configurada en cron"
else
    warning "Renovación automática no configurada en cron"
fi

echo ""
echo "[7] Verificando frontend..."
if [ -d "/home/ubuntu/landingStiven/frontend/dist" ]; then
    FILE_COUNT=$(ls -1 /home/ubuntu/landingStiven/frontend/dist 2>/dev/null | wc -l)
    if [ $FILE_COUNT -gt 0 ]; then
        echo "✅ Frontend compilado existe ($FILE_COUNT archivos)"
    else
        warning "Carpeta frontend/dist vacía o no compilada"
    fi
else
    warning "Carpeta frontend/dist no existe. Compila con: npm run build"
fi

echo ""
echo "[8] Verificando logs..."
if [ -f /var/log/nginx/stivenads_access.log ]; then
    echo "✅ Log de acceso de Nginx existe"
else
    warning "Log de acceso de Nginx no existe (se creará con el primer request)"
fi

if [ -f /var/log/letsencrypt/letsencrypt.log ]; then
    echo "✅ Log de Certbot existe"
else
    warning "Log de Certbot no existe"
fi

# Resumen
echo ""
echo "================================"
echo "📊 Resumen de Validación"
echo "================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "🎉 ¡Todo está funcionando correctamente!"
    else
        echo "⚠️  Sistema funcionando con $WARNINGS advertencias"
    fi
else
    echo "❌ Se encontraron $ERRORS errores"
    echo ""
    echo "Para más detalles, ver logs:"
    echo "  sudo tail -50 /var/log/nginx/error.log"
    echo "  sudo tail -50 /var/log/letsencrypt/letsencrypt.log"
fi

echo ""
echo "📋 Ver estado del sistema:"
echo "================================"
echo "Certificados:"
echo "  sudo certbot certificates"
echo ""
echo "Estado de Nginx:"
echo "  sudo systemctl status nginx"
echo ""
echo "Procesos escuchando:"
echo "  sudo netstat -tlnp | grep -E '80|443|3000'"
echo ""
echo "Pruebas:"
echo "  curl -I https://tu-dominio.com"
echo "  curl -I https://tu-dominio.com/api/health"
echo ""
