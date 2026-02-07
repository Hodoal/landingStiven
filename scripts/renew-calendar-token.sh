#!/bin/bash

# ============================================================
# Script para Renovar Token de Google Calendar Automáticamente
# ============================================================

set -e

PROJECT_DIR="/home/ubuntu/landingStiven"
API_ENV="$PROJECT_DIR/api/.env"
BACKEND_ENV="$PROJECT_DIR/backend/.env"

echo "=================================="
echo "🔄 Google Calendar Token Renewal"
echo "=================================="
echo ""

# Función para extraer valor de .env
get_env_value() {
  grep "^$1=" "$2" | cut -d'=' -f2- | tr -d '"'
}

# Leer valores actuales
GOOGLE_CLIENT_ID=$(get_env_value "GOOGLE_CLIENT_ID" "$API_ENV")
GOOGLE_CLIENT_SECRET=$(get_env_value "GOOGLE_CLIENT_SECRET" "$API_ENV")
GOOGLE_REDIRECT_URI=$(get_env_value "GOOGLE_REDIRECT_URI" "$API_ENV")

echo "ℹ️  Configuración actual:"
echo "   CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "   REDIRECT_URI: $GOOGLE_REDIRECT_URI"
echo ""

# Crear archivo temporal para el script de renovación
TEMP_SCRIPT=$(mktemp)

cat > "$TEMP_SCRIPT" << 'EOF'
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

(async () => {
  try {
    // Generar URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent'
    });

    console.log('\n🔗 Abre esta URL en tu navegador:');
    console.log('═'.repeat(80));
    console.log(authUrl);
    console.log('═'.repeat(80));
    console.log('\n✅ Autoriza la aplicación y copia el código de autorización.\n');

    // Solicitar código
    const code = await prompt('📋 Pega el código de autorización aquí: ');
    
    if (!code) {
      console.error('❌ Error: No se proporcionó código');
      process.exit(1);
    }

    // Intercambiar código por tokens
    console.log('\n🔄 Obteniendo tokens...');
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n✅ ¡Tokens obtenidos exitosamente!\n');
    console.log('═'.repeat(80));
    console.log('REFRESH TOKEN (Guarda esto en un lugar seguro):');
    console.log('═'.repeat(80));
    console.log(tokens.refresh_token);
    console.log('═'.repeat(80));
    console.log('\nACCESS TOKEN (Expira en ~1 hora):');
    console.log(tokens.access_token.substring(0, 50) + '...');
    console.log('\nEXPIRY DATE:');
    console.log(new Date(tokens.expiry_date).toLocaleString());
    console.log('═'.repeat(80) + '\n');

    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
})();
EOF

# Cambiar a directorio del proyecto
cd "$PROJECT_DIR"

echo "1️⃣ Generando URL de autorización de Google..."
echo ""

# Ejecutar el script con las variables de entorno
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
GOOGLE_REDIRECT_URI="$GOOGLE_REDIRECT_URI" \
node "$TEMP_SCRIPT"

# Limpiar
rm -f "$TEMP_SCRIPT"

# Preguntar si actualizar .env
echo ""
read -p "¿Deseas actualizar el token en los archivos .env? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo ""
  read -p "📋 Pega el nuevo REFRESH TOKEN: " -r NEW_REFRESH_TOKEN
  
  if [ -z "$NEW_REFRESH_TOKEN" ]; then
    echo "❌ Token vacío, cancelando..."
    exit 1
  fi

  echo ""
  echo "🔄 Actualizando archivos .env..."

  # Actualizar api/.env
  if grep -q "^GOOGLE_REFRESH_TOKEN=" "$API_ENV"; then
    sed -i "s/^GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$NEW_REFRESH_TOKEN/" "$API_ENV"
    echo "✅ Actualizado: $API_ENV"
  else
    echo "GOOGLE_REFRESH_TOKEN=$NEW_REFRESH_TOKEN" >> "$API_ENV"
    echo "✅ Agregado: $API_ENV"
  fi

  # Actualizar backend/.env
  if grep -q "^GOOGLE_REFRESH_TOKEN=" "$BACKEND_ENV"; then
    sed -i "s/^GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$NEW_REFRESH_TOKEN/" "$BACKEND_ENV"
    echo "✅ Actualizado: $BACKEND_ENV"
  else
    echo "GOOGLE_REFRESH_TOKEN=$NEW_REFRESH_TOKEN" >> "$BACKEND_ENV"
    echo "✅ Agregado: $BACKEND_ENV"
  fi

  echo ""
  echo "🔄 Reiniciando API..."
  pkill -f "node api/index.js" 2>/dev/null || true
  sleep 2
  cd "$PROJECT_DIR" && nohup node api/index.js > /tmp/api.log 2>&1 &
  
  sleep 5
  echo ""
  echo "✅ API reiniciada"
  echo ""
  echo "Verificando token..."
  curl -s http://localhost:5001/api/calendar/token/status | python3 -m json.tool 2>/dev/null || echo "⏳ API aún iniciando..."
fi

echo ""
echo "=================================="
echo "✅ Renovación completada"
echo "=================================="
