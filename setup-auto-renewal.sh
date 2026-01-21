#!/bin/bash

# Script para configurar renovación automática de certificados SSL

echo "================================"
echo "Configurando Renovación Automática de Certificados SSL"
echo "================================"
echo ""

echo "[1] Verificando que Certbot esté instalado..."
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot no está instalado. Ejecuta primero setup-nginx.sh"
    exit 1
fi

echo "[2] Probando renovación (dry-run)..."
sudo certbot renew --dry-run

if [ $? -ne 0 ]; then
    echo "❌ Error en la renovación"
    exit 1
fi

echo ""
echo "[3] Agregando entrada a crontab para renovación automática..."

# Crear un script wrapper para la renovación
sudo tee /usr/local/bin/certbot-renew.sh > /dev/null <<'EOF'
#!/bin/bash
/opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)'
/opt/certbot/bin/certbot renew -q --post-hook "systemctl reload nginx"
EOF

sudo chmod +x /usr/local/bin/certbot-renew.sh

# Agregar a crontab si no existe ya
if ! sudo crontab -l 2>/dev/null | grep -q "certbot-renew"; then
    echo "[4] Agregando tarea a crontab..."
    (sudo crontab -l 2>/dev/null; echo "0 0,12 * * * /usr/local/bin/certbot-renew.sh") | sudo crontab -
    echo "✅ Tarea agregada: Renovación automática dos veces al día (00:00 y 12:00)"
else
    echo "ℹ️ Tarea de renovación ya existe en crontab"
fi

echo ""
echo "[5] Verificando certificados instalados..."
sudo certbot certificates

echo ""
echo "✅ Renovación automática configurada!"
echo ""
echo "📅 Programación: Cada día a las 00:00 y 12:00"
echo ""
echo "🔍 Ver logs de renovación:"
echo "   sudo tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
