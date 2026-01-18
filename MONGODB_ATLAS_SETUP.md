# 🚀 MONGODB ATLAS SETUP

## Paso 1: Crear Cuenta
1. Ve a: https://www.mongodb.com/cloud/atlas
2. Click en "Sign Up Free"
3. Crea cuenta con email

## Paso 2: Crear Cluster
1. Haz click en "Build a Database"
2. Selecciona "FREE" tier
3. Selecciona región cercana (ej: N. Virginia o Canada)
4. Click "Create"

## Paso 3: Configurar Seguridad
1. En "Security Quickstart":
   - Username: `stivenads_user`
   - Password: (genera una segura, cópiala)
   - Click "Create User"

2. En "Where would you like to connect from?":
   - Selecciona "Cloud Environment" o "0.0.0.0/0" para permitir cualquier IP
   - Click "Finish and Close"

## Paso 4: Obtener Connection String
1. Click en "Databases"
2. Busca tu cluster
3. Click "Connect"
4. Selecciona "Drivers" → "Node.js"
5. Copia la connection string:
   ```
   mongodb+srv://stivenads_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Reemplaza PASSWORD con tu contraseña

## Paso 5: Guardar para después
- Guarda el connection string en un lugar seguro
- Lo necesitaremos para Vercel
