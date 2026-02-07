#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DESPLIEGUE RÁPIDO - Modal Fix${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${YELLOW}⚠️  Ejecuta este script desde /var/www/stivenads${NC}"
    echo "cd /var/www/stivenads && bash DEPLOY_MODAL_FIX.sh"
    exit 1
fi

echo -e "${BLUE}1️⃣  Actualizando código desde repositorio...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Error en git pull, continuando...${NC}"
fi

echo -e "\n${BLUE}2️⃣  Compilando frontend...${NC}"
cd frontend
npm ci
npm run build
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Error en build frontend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Frontend compilado${NC}"

echo -e "\n${BLUE}3️⃣  Instalando dependencias backend...${NC}"
cd backend
npm ci
cd ..
echo -e "${GREEN}✅ Backend dependencias instaladas${NC}"

echo -e "\n${BLUE}4️⃣  Reiniciando servicios con PM2...${NC}"
pm2 restart stivenads-backend
sleep 2
echo -e "${GREEN}✅ Backend reiniciado${NC}"

echo -e "\n${BLUE}5️⃣  Reiniciando Nginx...${NC}"
sudo systemctl restart nginx
sleep 2
echo -e "${GREEN}✅ Nginx reiniciado${NC}"

echo -e "\n${BLUE}6️⃣  Verificando health...${NC}"
HEALTH=$(curl -s https://stivenads.com/api/health | jq -r '.status' 2>/dev/null)
if [ "$HEALTH" == "ok" ]; then
    echo -e "${GREEN}✅ Backend responde correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no responde. Ver logs:${NC}"
    echo "pm2 logs stivenads-backend"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "Ver logs:"
echo "  pm2 logs stivenads-backend"
echo ""
echo "Probar en navegador:"
echo "  https://stivenads.com"
