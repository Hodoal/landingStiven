#!/bin/bash

# ========================================
# 🚀 SCRIPT DE DEPLOYMENT - STIVENADS
# ========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Iniciando deployment a producción"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Verificar dependencias
echo "✓ Verificando dependencias..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm no está instalado"; exit 1; }

# 2. Build del frontend
echo ""
echo "📦 Compilando frontend..."
cd "$(dirname "$0")/frontend"

if [ -d "node_modules" ]; then
  echo "   ✓ Dependencias encontradas"
else
  echo "   → Instalando dependencias..."
  npm ci --silent
fi

npm run build --silent

if [ $? -eq 0 ]; then
  echo "   ✓ Frontend compilado exitosamente"
  echo "   📁 Archivos en: $(pwd)/dist"
else
  echo "   ❌ Error compilando frontend"
  exit 1
fi

# 3. Backend - Verificar dependencias
echo ""
echo "📦 Preparando backend..."
cd "$(dirname "$0")/backend"

if [ -d "node_modules" ]; then
  echo "   ✓ Dependencias encontradas"
else
  echo "   → Instalando dependencias..."
  npm ci --silent
fi

# 4. Verificar archivos importantes
echo ""
echo "✓ Verificando configuración..."

files_to_check=(
  ".env"
  "server.js"
  "package.json"
)

for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ❌ Falta: $file"
    exit 1
  fi
done

# 5. Verificar variables de entorno críticas
echo ""
echo "✓ Validando variables de entorno..."

required_vars=(
  "MONGODB_URI"
  "NODE_ENV"
  "PORT"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "FRONTEND_URL"
)

source .env
missing_vars=0

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "   ⚠️  $var no está configurada"
    missing_vars=$((missing_vars + 1))
  else
    echo "   ✓ $var configurada"
  fi
done

if [ $missing_vars -gt 0 ]; then
  echo ""
  echo "⚠️  Faltan $missing_vars variables de entorno críticas"
  echo "   Revisa backend/.env y asegúrate de que todas están configuradas"
fi

# 6. Status del servidor
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT PREPARADO PARA PRODUCCIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Resumen:"
echo "   Frontend:  $(pwd)/../frontend/dist"
echo "   Backend:   $(pwd)"
echo "   Database:  ${MONGODB_URI}"
echo "   Puerto:    ${PORT}"
echo "   Node Env:  ${NODE_ENV}"
echo "   URL:       ${FRONTEND_URL}"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm start"
echo ""
echo "ℹ️  Para desarrollo:"
echo "   npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
