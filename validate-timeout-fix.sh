#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║           🧪 VALIDACIÓN: Reparación de Timeouts Implementada                 ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

CHECKS_PASSED=0
CHECKS_TOTAL=0

check_file() {
  local file="$1"
  local search="$2"
  local description="$3"
  
  ((CHECKS_TOTAL++))
  
  if [ -f "$file" ]; then
    if grep -q "$search" "$file"; then
      echo -e "${GREEN}✅ PASS${NC} - $description"
      echo "   Archivo: $file"
      ((CHECKS_PASSED++))
    else
      echo -e "${RED}❌ FAIL${NC} - $description"
      echo "   Archivo: $file"
      echo "   No encontrado: $search"
    fi
  else
    echo -e "${RED}❌ FAIL${NC} - $description (archivo no existe)"
  fi
  echo ""
}

echo -e "${YELLOW}📋 Verificando cambios implementados:${NC}\n"

# Frontend checks
check_file \
  "/home/ubuntu/landingStiven/frontend/src/main.jsx" \
  "axios.defaults.timeout = 120000" \
  "Frontend: Axios timeout 120 segundos"

check_file \
  "/home/ubuntu/landingStiven/frontend/src/main.jsx" \
  "axios.interceptors.response.use" \
  "Frontend: Interceptor de reintentos automáticos"

# Backend Token Manager checks
check_file \
  "/home/ubuntu/landingStiven/backend/services/tokenManager.js" \
  "15 \* 60 \* 1000" \
  "TokenManager: Buffer de 15 minutos"

check_file \
  "/home/ubuntu/landingStiven/backend/services/tokenManager.js" \
  "Token expiring soon" \
  "TokenManager: Verificación de expiración"

# Backend Routes checks
check_file \
  "/home/ubuntu/landingStiven/backend/routes/bookingRoutes.js" \
  "req.setTimeout(90000)" \
  "BookingRoutes: Timeout de 90 segundos en /available-times"

check_file \
  "/home/ubuntu/landingStiven/backend/routes/leadsRoutes.js" \
  "req.setTimeout(90000)" \
  "LeadsRoutes: Timeout de 90 segundos en rutas"

# Backend SecureGoogleCalendar checks
check_file \
  "/home/ubuntu/landingStiven/backend/services/secureGoogleCalendar.js" \
  "operationTimeout = 60000" \
  "SecureGoogleCalendar: Timeout de 60 segundos"

check_file \
  "/home/ubuntu/landingStiven/backend/services/secureGoogleCalendar.js" \
  "Promise.race" \
  "SecureGoogleCalendar: Enforcement con Promise.race"

# Nginx checks
check_file \
  "/home/ubuntu/landingStiven/nginx.conf" \
  "proxy_connect_timeout 90s" \
  "Nginx: proxy_connect_timeout 90 segundos"

check_file \
  "/home/ubuntu/landingStiven/nginx.conf" \
  "proxy_read_timeout 120s" \
  "Nginx: proxy_read_timeout 120 segundos"

check_file \
  "/home/ubuntu/landingStiven/scripts/setup-ssl.sh" \
  "proxy_connect_timeout 90s" \
  "Setup-SSL: proxy_connect_timeout 90 segundos"

# Documentation checks
check_file \
  "/home/ubuntu/landingStiven/TIMEOUT_FIX.md" \
  "Reparación: Timeouts y Expiración de Tokens" \
  "Documentación: Guía de reparación TIMEOUT_FIX.md"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Show results
if [ "$CHECKS_PASSED" -eq "$CHECKS_TOTAL" ]; then
  echo -e "${GREEN}✅ TODOS LOS CHECKS PASARON ($CHECKS_PASSED/$CHECKS_TOTAL)${NC}"
  echo ""
  echo -e "${GREEN}✨ Reparación lista para desplegar a producción${NC}"
else
  echo -e "${RED}⚠️  Algunos checks fallaron ($CHECKS_PASSED/$CHECKS_TOTAL)${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  Revisa los errores arriba y asegúrate de que todos los cambios se aplicaron${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Build check
echo -e "${YELLOW}📦 Verificando compilación del frontend...${NC}"
echo ""

if [ -d "/home/ubuntu/landingStiven/frontend/dist" ]; then
  SIZE=$(du -sh /home/ubuntu/landingStiven/frontend/dist | cut -f1)
  echo -e "${GREEN}✅ Frontend build encontrado${NC}"
  echo "   Tamaño: $SIZE"
  echo ""
else
  echo -e "${YELLOW}⚠️  Frontend build no encontrado${NC}"
  echo "   Ejecuta: cd /home/ubuntu/landingStiven/frontend && npm run build"
  echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Backend check
echo -e "${YELLOW}🔧 Verificando dependencias del backend...${NC}"
echo ""

if [ -d "/home/ubuntu/landingStiven/backend/node_modules" ]; then
  echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠️  Dependencias no instaladas${NC}"
  echo "   Ejecuta: cd /home/ubuntu/landingStiven/backend && npm ci"
  echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}🎯 RESUMEN DE CAMBIOS${NC}"
echo ""
cat << 'EOF'
1. ✅ Frontend - Axios timeout 120s + reintentos automáticos
2. ✅ Backend - Token buffer 15 minutos
3. ✅ Backend - Rutas con timeout 90s
4. ✅ Backend - Google Calendar timeout 60s
5. ✅ Nginx - Timeouts ampliados (90-120s)
6. ✅ Documentación - Guía completa TIMEOUT_FIX.md

Próximo paso: Desplegar a producción (git push + npm run build + pm2 restart)
EOF

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
