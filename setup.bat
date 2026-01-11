@echo off
echo ======================================
echo Stivenads - Setup Inicial
echo ======================================

REM Crear carpeta frontend
cd frontend
echo 📦 Instalando dependencias del frontend...
call npm install

echo ✅ Frontend listo

REM Crear carpeta backend
cd ..\backend
echo 📦 Instalando dependencias del backend...
call npm install

echo ✅ Backend listo

REM Crear .env si no existe
if not exist .env (
    echo ⚙️  Creando archivo .env...
    copy .env.example .env
    echo ⚠️  Por favor, completa las variables en backend\.env
)

cd ..

echo.
echo ======================================
echo ✅ Setup completado!
echo ======================================
echo.
echo Para ejecutar la aplicación:
echo.
echo Terminal 1 (Backend):
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend ^&^& npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
pause
