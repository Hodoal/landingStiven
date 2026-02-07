#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════════════════╗
# ║                    SETUP VPS DIRECTO - STIVENADS                              ║
# ║                    Script de instalación automático                           ║
# ╚════════════════════════════════════════════════════════════════════════════════╝

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   🚀 SETUP VPS DIRECTO - STIVENADS 🚀                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para imprimir pasos
step() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Verificar que se ejecuta como root
echo -e "${BLUE}[1/10] Verificando permisos...${NC}"
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root"
fi
step "Ejecutando como root"

# 2. Actualizar sistema
echo ""
echo -e "${BLUE}[2/10] Actualizando sistema...${NC}"
apt update
apt upgrade -y
step "Sistema actualizado"

# 3. Instalar Node.js
echo ""
echo -e "${BLUE}[3/10] Instalando Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -sL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    step "Node.js 18 instalado"
else
    step "Node.js ya está instalado: $(node -v)"
fi

# 4. Instalar MongoDB
echo ""
echo -e "${BLUE}[4/10] Instalando MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    apt install -y mongodb
    systemctl enable mongodb
    systemctl start mongodb
    step "MongoDB instalado e iniciado"
else
    step "MongoDB ya está instalado"
fi

# 5. Instalar Nginx
echo ""
echo -e "${BLUE}[5/10] Instalando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    step "Nginx instalado e iniciado"
else
    step "Nginx ya está instalado"
fi

# 6. Instalar PM2
echo ""
echo -e "${BLUE}[6/10] Instalando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root > /dev/null
    step "PM2 instalado"
else
    step "PM2 ya está instalado"
fi

# 7. Instalar Certbot (SSL)
echo ""
echo -e "${BLUE}[7/10] Instalando Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    step "Certbot instalado"
else
    step "Certbot ya está instalado"
fi

# 8. Crear usuario para la aplicación
echo ""
echo -e "${BLUE}[8/10] Configurando usuario de aplicación...${NC}"
if ! id -u stivenads &> /dev/null; then
    useradd -m -s /bin/bash stivenads
    usermod -aG sudo stivenads
    step "Usuario 'stivenads' creado"
else
    step "Usuario 'stivenads' ya existe"
fi

# 9. Crear directorios
echo ""
echo -e "${BLUE}[9/10] Creando directorios...${NC}"
mkdir -p /var/www/stivenads
mkdir -p /var/log/stivenads
chown -R stivenads:stivenads /var/www/stivenads
chown -R stivenads:stivenads /var/log/stivenads
step "Directorios creados"

# 10. Mostrar información
echo ""
echo -e "${BLUE}[10/10] Completado${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✨ SETUP COMPLETADO EXITOSAMENTE ✨                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Información instalada:${NC}"
echo "  • Node.js: $(node -v)"
echo "  • npm: $(npm -v)"
echo "  • MongoDB: $(mongod --version | head -1)"
echo "  • Nginx: $(nginx -v 2>&1 | awk '{print $3}')"
echo "  • PM2: $(pm2 -v)"
echo "  • Certbot: $(certbot --version)"
echo ""

echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Clona el repositorio:"
echo -e "   ${BLUE}cd /var/www/stivenads${NC}"
echo -e "   ${BLUE}sudo -u stivenads git clone https://github.com/tuusuario/landingStiven.git .${NC}"
echo ""

echo "2. Instala dependencias:"
echo -e "   ${BLUE}cd /var/www/stivenads/backend${NC}"
echo -e "   ${BLUE}sudo -u stivenads npm ci${NC}"
echo -e "   ${BLUE}cd ../frontend && sudo -u stivenads npm ci${NC}"
echo ""

echo "3. Configura variables de entorno:"
echo -e "   ${BLUE}sudo nano /var/www/stivenads/backend/.env${NC}"
echo ""

echo "4. Construye el frontend:"
echo -e "   ${BLUE}cd /var/www/stivenads/frontend${NC}"
echo -e "   ${BLUE}sudo -u stivenads npm run build${NC}"
echo ""

echo "5. Inicia el backend con PM2:"
echo -e "   ${BLUE}cd /var/www/stivenads/backend${NC}"
echo -e "   ${BLUE}pm2 start npm --name stivenads-backend -- start${NC}"
echo -e "   ${BLUE}pm2 save${NC}"
echo ""

echo "6. Configura Nginx:"
echo -e "   ${BLUE}sudo nano /etc/nginx/sites-available/stivenads${NC}"
echo -e "   (Copia la configuración de nginx.conf en el repo)"
echo -e "   ${BLUE}sudo ln -s /etc/nginx/sites-available/stivenads /etc/nginx/sites-enabled/${NC}"
echo -e "   ${BLUE}sudo nginx -t${NC}"
echo -e "   ${BLUE}sudo systemctl restart nginx${NC}"
echo ""

echo "7. Obtén certificado SSL:"
echo -e "   ${BLUE}sudo certbot certonly --nginx -d stivenads.com -d www.stivenads.com${NC}"
echo ""

echo "8. Verifica que todo funciona:"
echo -e "   ${BLUE}curl http://localhost:3001/api/health${NC}"
echo -e "   ${BLUE}curl http://localhost${NC}"
echo ""

echo -e "${YELLOW}Documentación importante:${NC}"
echo "  • Guía completa: /var/www/stivenads/DEPLOYMENT_GUIDE.md"
echo "  • Checklist producción: /var/www/stivenads/PRODUCTION_CHECKLIST.md"
echo "  • Logs: /var/log/stivenads/"
echo ""

echo -e "${GREEN}¡Sistema listo para Stivenads!${NC}"
echo ""
