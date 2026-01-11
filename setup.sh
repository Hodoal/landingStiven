#!/bin/bash

echo "======================================"
echo "Stivenads - Setup Inicial"
echo "======================================"

# Crear carpeta frontend
cd frontend
echo "📦 Instalando dependencias del frontend..."
npm install

echo "✅ Frontend listo"

# Crear carpeta backend
cd ../backend
echo "📦 Instalando dependencias del backend..."
npm install

echo "✅ Backend listo"

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor, completa las variables en backend/.env"
fi

cd ..

echo ""
echo "======================================"
echo "✅ Setup completado!"
echo "======================================"
echo ""
echo "Para ejecutar la aplicación:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
