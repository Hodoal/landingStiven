#!/bin/bash

# Nginx + Certbot Setup Script for Stivenads
# Este script configura Nginx y Certbot para servir la aplicación en HTTPS

set -e

echo "================================"
echo "Nginx + Certbot Setup"
echo "================================"
echo ""

# Detectar si es Ubuntu/Debian o CentOS/Fedora
if [ -f /etc/debian_version ]; then
    echo "[1] Actualizando sistema (APT)..."
    sudo apt update
    
    echo "[2] Instalando dependencias del sistema..."
    sudo apt install -y python3 python3-dev python3-venv libaugeas-dev gcc nginx
    
elif [ -f /etc/redhat-release ]; then
    echo "[1] Actualizando sistema (DNF/YUM)..."
    sudo dnf update -y || sudo yum update -y
    
    echo "[2] Instalando dependencias del sistema..."
    sudo dnf install -y python3 python3-devel augeas-devel gcc nginx || \
    sudo yum install -y python3 python3-devel augeas-devel gcc nginx
else
    echo "❌ Sistema operativo no soportado. Se requiere Ubuntu/Debian o CentOS/Fedora"
    exit 1
fi

echo "[3] Removiendo versiones anteriores de certbot..."
sudo apt-get remove certbot 2>/dev/null || sudo dnf remove certbot 2>/dev/null || sudo yum remove certbot 2>/dev/null || true

echo "[4] Creando entorno virtual para Certbot..."
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip

echo "[5] Instalando Certbot y plugin de Nginx..."
sudo /opt/certbot/bin/pip install certbot certbot-nginx

echo "[6] Creando symlink para certbot..."
sudo ln -sf /opt/certbot/bin/certbot /usr/local/bin/certbot

echo "[7] Iniciar servicio Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "✅ Instalación completada!"
echo ""
echo "🔐 Pasos siguientes:"
echo ""
echo "1. Asegúrate de que tu dominio apunte a esta IP pública"
echo "2. Para obtener certificado SSL automáticamente:"
echo "   sudo certbot --nginx"
echo ""
echo "3. Para obtener solo el certificado (configuración manual):"
echo "   sudo certbot certonly --nginx"
echo ""
echo "4. Ver/renovar certificados:"
echo "   sudo certbot certificates"
echo ""
echo "5. Probar renovación automática:"
echo "   sudo certbot renew --dry-run"
echo ""
echo "================================"
