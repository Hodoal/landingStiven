#!/bin/bash

# Script de Verificación de Facebook Pixel
# Este script ayuda a verificar que el pixel está correctamente instalado

echo "================================================"
echo "🔍 Verificación de Facebook Pixel"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "frontend/index.html" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

echo "📋 Checklist de Integración:"
echo ""

# 1. Verificar index.html
echo -n "1. Verificando código de pixel en index.html... "
if grep -q "fbq('init', '2118145782285965')" frontend/index.html; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ No encontrado${NC}"
fi

# 2. Verificar servicio de Facebook Pixel
echo -n "2. Verificando servicio facebookPixel.js... "
if [ -f "frontend/src/services/facebookPixel.js" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ No encontrado${NC}"
fi

# 3. Verificar componentes con tracking
echo ""
echo "3. Verificando componentes con tracking:"

components=(
    "frontend/src/App.jsx"
    "frontend/src/components/Hero.jsx"
    "frontend/src/components/Header.jsx"
    "frontend/src/components/CTA.jsx"
    "frontend/src/components/FloatingButton.jsx"
    "frontend/src/components/BookingModal.jsx"
    "frontend/src/components/PilotApplicationModal.jsx"
)

for component in "${components[@]}"; do
    component_name=$(basename "$component")
    echo -n "   - $component_name... "
    if grep -q "useFacebookPixel\|fbEvents" "$component"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Sin tracking${NC}"
    fi
done

# 4. Verificar documentación
echo ""
echo -n "4. Verificando documentación... "
if [ -f "docs/FACEBOOK_PIXEL_INTEGRATION.md" ] && [ -f "docs/FACEBOOK_PIXEL_SUMMARY.md" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Falta documentación${NC}"
fi

echo ""
echo "================================================"
echo "📊 Eventos Configurados:"
echo "================================================"
echo ""

# Buscar eventos en el servicio
echo "Eventos Estándar:"
grep -oE "trackEvent\('[^']+'" frontend/src/services/facebookPixel.js | sort -u | sed 's/trackEvent(/  • /' | sed "s/'//g"

echo ""
echo "Eventos Personalizados:"
grep -oE "trackCustomEvent\('[^']+'" frontend/src/services/facebookPixel.js | sort -u | sed 's/trackCustomEvent(/  • /' | sed "s/'//g"

echo ""
echo "================================================"
echo "🧪 Próximos Pasos de Verificación:"
echo "================================================"
echo ""
echo "1. Instala Facebook Pixel Helper:"
echo "   ${YELLOW}https://chrome.google.com/webstore/detail/facebook-pixel-helper/${NC}"
echo ""
echo "2. Inicia el servidor de desarrollo:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Abre el navegador y la consola de desarrollador"
echo ""
echo "4. Busca mensajes en consola:"
echo "   ${YELLOW}📊 Facebook Pixel: ...${NC}"
echo ""
echo "5. Verifica eventos en Facebook Events Manager:"
echo "   ${YELLOW}https://business.facebook.com/events_manager${NC}"
echo "   Pixel ID: ${YELLOW}2118145782285965${NC}"
echo ""
echo "================================================"
echo "✅ Verificación Completa"
echo "================================================"
