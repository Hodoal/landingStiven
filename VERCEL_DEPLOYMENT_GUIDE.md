# 🚀 DESPLIEGUE EN VERCEL - PASO A PASO

## BACKEND EN VERCEL

### Paso 1: Preparación Local
✅ Git push ya completado
✅ vercel.json ya creado

### Paso 2: Deploy del Backend
1. **Instala Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login a Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/javier/Desktop/landing_stiven
   vercel --prod
   ```
   
   Durante el deploy:
   - Nombre del proyecto: `stivenads-backend`
   - ¿Es monorepo?: Selecciona el backend
   - Framework: `Other`

4. **Configurar Variables de Entorno en Vercel:**
   - Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto `stivenads-backend`
   - Vé a "Settings" → "Environment Variables"
   - Añade estas variables:
   
   ```
   MONGODB_URI = mongodb+srv://user:password@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   NODE_ENV = production
   GOOGLE_CALENDAR_API_KEY = [tu api key]
   GOOGLE_CLIENT_ID = [tu client id]
   GOOGLE_CLIENT_SECRET = [tu client secret]
   SENDGRID_API_KEY = [si usas emails]
   ```

5. **Redeploy después de agregar variables:**
   ```bash
   vercel --prod --forceRebuild
   ```

6. **Obtén la URL del backend:**
   - En Vercel dashboard veras la URL (ej: `https://stivenads-backend.vercel.app`)

---

## FRONTEND EN VERCEL

### Paso 1: Configurar .env.production
En el directorio `frontend/`, crea `.env.production`:

```
VITE_API_BASE_URL = https://stivenads-backend.vercel.app/api
```

### Paso 2: Deploy del Frontend
1. **Desde la carpeta frontend:**
   ```bash
   cd /Users/javier/Desktop/landing_stiven/frontend
   vercel --prod --name stivenads-frontend
   ```

2. **Configurar Variables en Vercel:**
   - Ve a Settings del frontend
   - Añade:
   ```
   VITE_API_BASE_URL = https://stivenads-backend.vercel.app/api
   ```

---

## VERIFICACIÓN

### Testing Backend:
```bash
curl https://stivenads-backend.vercel.app/api/health
```

Deberías ver:
```json
{"status":"OK","message":"Server is running"}
```

### Testing Frontend:
- Abre: https://stivenads-frontend.vercel.app
- Debería conectarse al backend automáticamente

---

## TROUBLESHOOTING

Si hay errores, revisa:
1. **Logs de Vercel:**
   ```bash
   vercel logs --prod
   ```

2. **Variables de Entorno:**
   - Verifica que MONGODB_URI sea correcta
   - Verifica que las APIs keys sean válidas

3. **CORS:**
   - Verifica que backend permita CORS desde frontend URL

---

## PRÓXIMAS ACTUALIZACIONES

Para actualizar el código después:
```bash
git add .
git commit -m "descripción"
git push origin main
vercel --prod --forceRebuild
```

Vercel redesplegará automáticamente.
