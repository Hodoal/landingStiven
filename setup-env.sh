#!/bin/bash

# 🚀 Script Automático - Setup de Variables de Entorno para Vercel Deployment

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Landing Stiven - Environment Setup para Vercel Deploy      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ Error: No estás en la carpeta raíz del proyecto${NC}"
    echo "Navega a: /Users/javier/Desktop/landing_stiven"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto${NC}"
echo ""

# 2. Create .env file
echo -e "${BLUE}📝 Creando archivo .env en backend/${NC}"

cat > backend/.env << 'EOF'
# ========================================
# 🗄️ MONGODB
# ========================================
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/stivenads

# ========================================
# 🔐 GOOGLE CALENDAR
# ========================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_ID=
GOOGLE_REFRESH_TOKEN=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# ========================================
# 📧 GMAIL
# ========================================
GMAIL_USER=tu-email@gmail.com
GMAIL_PASSWORD=

# ========================================
# 🚀 SERVER
# ========================================
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

echo -e "${GREEN}✅ Archivo .env creado${NC}"
echo ""

# 3. Create .env.production for frontend
echo -e "${BLUE}📝 Creando archivo .env.production en frontend/${NC}"

cat > frontend/.env.production << 'EOF'
VITE_API_URL=https://landing-stiven-backend.onrender.com
EOF

echo -e "${GREEN}✅ Archivo .env.production creado${NC}"
echo ""

# 4. Instructions
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 PRÓXIMOS PASOS - Completar Variables:${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}1️⃣  MONGODB Connection String${NC}"
echo "   📍 Ubicación: backend/.env"
echo "   🔗 Obtener de: https://cloud.mongodb.com"
echo "   📌 Formato: mongodb+srv://user:password@cluster.mongodb.net/stivenads"
echo ""

echo -e "${BLUE}2️⃣  Google Calendar API Credentials${NC}"
echo "   📍 Ubicación: backend/.env"
echo "   🔗 Obtener de: https://console.cloud.google.com"
echo "   Variables:"
echo "      - GOOGLE_CLIENT_ID"
echo "      - GOOGLE_CLIENT_SECRET"
echo "      - GOOGLE_CALENDAR_ID"
echo "      - GOOGLE_REFRESH_TOKEN (ejecutar: node backend/get-refresh-token.js)"
echo ""

echo -e "${BLUE}3️⃣  Gmail App Password${NC}"
echo "   📍 Ubicación: backend/.env"
echo "   🔗 Obtener de: https://myaccount.google.com/apppasswords"
echo "   ⚠️  Requiere 2FA habilitado"
echo "   📌 Formato: 16 caracteres (xxxx xxxx xxxx xxxx)"
echo ""

echo -e "${BLUE}4️⃣  Editar los archivos creados:${NC}"
echo "   📄 backend/.env"
echo "   📄 frontend/.env.production"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup incompleto - Edita los archivos .env con tus valores${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 5. Summary
echo -e "${BLUE}📁 Archivos creados:${NC}"
echo "   ✓ backend/.env"
echo "   ✓ frontend/.env.production"
echo ""

echo -e "${BLUE}📖 Documentación:${NC}"
echo "   📄 ENV_SETUP_COMPLETE_GUIDE.md (paso a paso detallado)"
echo "   📄 ENV_QUICK_REFERENCE.md (referencia rápida)"
echo "   📄 .env.template (template con comentarios)"
echo ""

echo -e "${GREEN}🎉 Setup automático completado!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   1. Completa las variables en backend/.env"
echo "   2. Prueba en local: npm start (desde backend)"
echo "   3. Luego deploya en Render y Vercel"
echo ""
