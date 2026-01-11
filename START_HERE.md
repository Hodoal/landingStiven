# 🎯 Stivenads - Plataforma de Agendamiento de Asesorías

Bienvenido a **Stivenads**, una plataforma profesional de agendamiento de asesorías de marketing diseñada desde cero.

## ¿Qué es Stivenads?

Stivenads es una **landing page + sistema de agendamiento** completo para empresas que ofrecen asesorías de marketing. Permite que los clientes:

1. Conozcan los servicios a través de una landing page atractiva
2. Agendan asesorías directamente desde el navegador
3. Reciben confirmación automática por correo con enlace de Teams
4. Evitan conflictos de horarios con validación automática

## 🚀 Características Principales

### Frontend
- ✨ Landing page moderna y minimalista
- 📱 100% responsiva (mobile, tablet, desktop)
- ⚡ Animaciones suaves con scroll dinámico
- 🎨 Diseño profesional con colores corporativos
- 📅 Calendario interactivo para seleccionar fechas
- 💬 Modal de agendamiento de 3 pasos
- 🎯 Botón flotante inteligente

### Backend
- 🔐 API REST segura y eficiente
- 📊 Base de datos MongoDB integrada
- 📅 Integración con Google Calendar (preparada)
- 📧 Sistema de emails automáticos (preparado)
- 🤝 Links de Teams autogenerados
- ✅ Validaciones de conflictos de horarios

## 📁 Estructura del Proyecto

```
landing_stiven/
├── frontend/              # Aplicación React + Vite
├── backend/               # Servidor Node.js + Express
├── README.md              # Documentación principal
├── QUICK_START.md         # Guía de inicio (EMPIEZA AQUÍ)
├── CUSTOMIZATION.md       # Cómo personalizar
├── DEPLOYMENT.md          # Cómo desplegar
└── ... (más documentación)
```

## 🎬 Inicio Rápido (5 minutos)

### 1. Clonar/Descargar el Proyecto
```bash
cd landing_stiven
```

### 2. Instalar Dependencias
**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

### 3. Configurar Variables de Entorno
```bash
cd backend
nano .env  # Editar con tus credenciales
```

### 4. Iniciar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acceder
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

¡Listo! Ahora puedes explorar la aplicación.

## 📚 Documentación

Tenemos documentación para cada aspecto del proyecto:

| Documento | Propósito |
|-----------|-----------|
| [QUICK_START.md](QUICK_START.md) | Inicio rápido (RECOMENDADO) |
| [README.md](README.md) | Documentación completa |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Cómo personalizar |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Cómo desplegar a producción |
| [TESTING.md](TESTING.md) | Cómo hacer testing |
| [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md) | Configurar Google Calendar |
| [EMAIL_SETUP.md](EMAIL_SETUP.md) | Configurar emails |
| [MONGODB_SETUP.md](MONGODB_SETUP.md) | Configurar base de datos |
| [VERIFICATION.md](VERIFICATION.md) | Verificación del proyecto |
| [SUMMARY.md](SUMMARY.md) | Resumen técnico |

## 🛠 Requisitos Previos

- Node.js v16+
- MongoDB (local o Atlas)
- Cuenta de Google (para Google Calendar)
- Cuenta de Gmail (para correos)

## 📦 Tecnologías

### Frontend
- React 18
- Vite
- Framer Motion
- React Icons
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Google Calendar API
- Nodemailer

## 🎨 Diseño

- **Colores:** Azul oscuro (#0a0e27) + Amarillo (#f4c430)
- **Tipografía:** Sans-serif moderna
- **Iconos:** React Icons (sin emojis)
- **Layout:** Minimalista y profesional

## ✅ Checklist Inicial

Antes de usar el proyecto:

- [ ] Lee [QUICK_START.md](QUICK_START.md)
- [ ] Instala las dependencias
- [ ] Configura `.env` en backend
- [ ] Inicia backend y frontend
- [ ] Accede a http://localhost:5173
- [ ] Prueba el formulario de agendamiento
- [ ] Personaliza según necesites

## 🔧 Personalización

Stivenads está diseñado para ser fácil de personalizar:

- **Textos:** Edita directamente en los componentes JSX
- **Colores:** Cambia las variables CSS en `index.css`
- **Logo:** Reemplaza en `Logo.jsx`
- **Contacto:** Actualiza en `Footer.jsx`
- **Horarios:** Modifica en backend `bookingRoutes.js`

Ver [CUSTOMIZATION.md](CUSTOMIZATION.md) para guía completa.

## 🚀 Deployment

Stivenads puede desplegarse en múltiples plataformas:

- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Heroku, Railway, AWS, Digital Ocean

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas.

## 🆘 Soporte

### Problemas Comunes

**"Port 3001 already in use"**
```bash
# Cambiar puerto en server.js
PORT=3002
```

**"MongoDB connection error"**
- Verifica que MongoDB está corriendo
- Revisa MONGODB_URI en .env
- Ver [MONGODB_SETUP.md](MONGODB_SETUP.md)

**"Email not sending"**
- Verifica credenciales en .env
- Ver [EMAIL_SETUP.md](EMAIL_SETUP.md)

### Recursos

- [Documentación Completa](README.md)
- [Guía de Testing](TESTING.md)
- [Ejemplos de Código](TESTING.md#ejemplos-de-uso-y-testing)

## 💡 Características Especiales

### 🎯 Validación de Conflictos
Stivenads automáticamente previene que dos personas agenderen en el mismo horario.

### 🌊 Scroll Dinámico
El contenido aparece con animaciones suaves mientras haces scroll.

### 📱 Totalmente Responsivo
Funciona perfectamente en desktop, tablet y mobile.

### 🎨 Minimalista
Diseño limpio y profesional que inspira confianza.

### ⚡ Rápido
Carga rápidamente, óptimo performance.

## 📊 Estadísticas

- **14 Componentes React**
- **6 Endpoints API**
- **9 Documentos de ayuda**
- **100% Responsivo**
- **5000+ Líneas de código**

## 🎓 Estructura de Aprendizaje

Si eres nuevo, lee en este orden:

1. [QUICK_START.md](QUICK_START.md) - 5 min
2. [README.md](README.md) - 10 min
3. [CUSTOMIZATION.md](CUSTOMIZATION.md) - 10 min
4. Explora el código - 30 min

## 🚀 Próximos Pasos

1. **Ahora:** Leer [QUICK_START.md](QUICK_START.md)
2. **Setup:** Instalar y configurar (.env)
3. **Test:** Probar la aplicación localmente
4. **Custom:** Personalizar contenido y colores
5. **Deploy:** Desplegar a producción

## 📞 Contacto

Para preguntas o sugerencias sobre el código:
- Email: info@stivenads.com
- Teléfono: +57 300 000 0000

## 📄 Licencia

Copyright © 2024 Stivenads. Todos los derechos reservados.

---

## 🎯 ¡Comienza Ahora!

### Primer paso: Lee QUICK_START.md

```bash
cat QUICK_START.md
```

O abre en tu editor favorito el archivo `QUICK_START.md`

¡Buena suerte! 🚀
