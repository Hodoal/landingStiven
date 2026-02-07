#!/bin/bash

# Script interactivo para obtener y configurar nuevo refresh token

set -e

PROJECT_DIR="/home/ubuntu/landingStiven"
API_ENV="$PROJECT_DIR/api/.env"
BACKEND_ENV="$PROJECT_DIR/backend/.env"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔄 Google Calendar Token Renewal                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Leer el código del usuario
read -p "📌 Pega el código de autorización aquí: " AUTH_CODE

if [ -z "$AUTH_CODE" ]; then
  echo "❌ Código vacío. Abortando..."
  exit 1
fi

echo ""
echo "⏳ Intercambiando código por refresh token..."
echo ""

# Usar Node.js para intercambiar el código por refresh token
REFRESH_TOKEN=$(node << NODEJS
const { google } = require('googleapis');
require('dotenv').config({ path: '$API_ENV' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

(async () => {
  try {
    const { tokens } = await oauth2Client.getToken('$AUTH_CODE');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
NODEJS
)

if [ -z "$REFRESH_TOKEN" ]; then
  echo "❌ Error obteniendo refresh token"
  exit 1
fi

echo "✅ Refresh token obtenido exitosamente"
echo ""
echo "🔑 Nuevo Refresh Token:"
echo "   ${REFRESH_TOKEN:0:50}..."
echo ""

# Actualizar archivos .env
echo "📝 Actualizando archivos .env..."

# Función para actualizar .env
update_env() {
  local env_file=$1
  local token=$2
  
  if grep -q "^GOOGLE_REFRESH_TOKEN=" "$env_file"; then
    sed -i "s/^GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$token/" "$env_file"
  else
    echo "GOOGLE_REFRESH_TOKEN=$token" >> "$env_file"
  fi
  echo "   ✅ $env_file actualizado"
}

update_env "$API_ENV" "$REFRESH_TOKEN"
update_env "$BACKEND_ENV" "$REFRESH_TOKEN"

echo ""
echo "✅ Variables de entorno actualizadas"
echo ""

# Reiniciar el servidor
echo "🔄 Reiniciando API..."
pkill -f "node api/index.js" || true
sleep 2

cd "$PROJECT_DIR"
node api/index.js > /tmp/api-token.log 2>&1 &

echo "⏳ Esperando inicio del servidor..."
sleep 5

# Verificar que el servidor está corriendo
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
  echo "✅ Servidor iniciado correctamente"
  
  # Verificar estado del token
  sleep 3
  echo ""
  echo "🔍 Verificando estado del token..."
  curl -s http://localhost:5001/api/calendar/token/status | python3 -m json.tool 2>/dev/null | head -20
else
  echo "⚠️  Servidor no respondió. Revisa los logs:"
  echo "    tail -f /tmp/api-token.log"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Token renovado exitosamente                              ║"
echo "║  🚀 Listo para deploy a producción                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
