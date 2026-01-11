# Guía de Personalización

## 1. Cambiar Contenido de la Landing Page

### Editar Textos Principales

**Hero Section** - [frontend/src/components/Hero.jsx](frontend/src/components/Hero.jsx)
```jsx
<h1>Transforma tu Negocio con Estrategias de Marketing Efectivas</h1>
<p>Conecta directamente con expertos en marketing para recibir asesorías personalizadas...</p>
```

**Sección de Problemas** - [frontend/src/components/Problems.jsx](frontend/src/components/Problems.jsx)
```jsx
const problems = [
  {
    icon: FiTrendingDown,
    title: 'Sin Estrategia Clara',
    description: 'No sabes por dónde empezar...'
  },
  // ... más problemas
]
```

**Sección de Soluciones** - [frontend/src/components/Solutions.jsx](frontend/src/components/Solutions.jsx)

**FAQ** - [frontend/src/components/FAQ.jsx](frontend/src/components/FAQ.jsx)

## 2. Cambiar Colores

### Colores Globales

Edita [frontend/src/index.css](frontend/src/index.css):

```css
:root {
  --color-dark: #0a0e27;           /* Azul oscuro */
  --color-darker: #050817;         /* Negro azulado */
  --color-blue: #1f2d5c;           /* Azul corporativo */
  --color-blue-light: #2d3e7f;     /* Azul claro */
  --color-yellow: #f4c430;         /* Amarillo - CAMBIAR AQUÍ */
  --color-text: #ffffff;
  --color-text-light: #b0bfd9;
}
```

### Ejemplos de Paletas Alternativas

**Paleta Verde**
```css
--color-yellow: #22c55e;    /* Verde */
--color-blue: #065f46;      /* Verde oscuro */
```

**Paleta Púrpura**
```css
--color-yellow: #a855f7;    /* Púrpura */
--color-blue: #581c87;      /* Púrpura oscuro */
```

**Paleta Roja**
```css
--color-yellow: #ef4444;    /* Rojo */
--color-blue: #7f1d1d;      /* Rojo oscuro */
```

## 3. Cambiar Logo

### Reemplazar Logo de Stivenads

Edita [frontend/src/components/Logo.jsx](frontend/src/components/Logo.jsx):

```jsx
// Opción 1: Usar imagen
<img src="/logo.png" alt="Logo" />

// Opción 2: Cambiar SVG
<svg viewBox="0 0 40 40">
  {/* Tu SVG aquí */}
</svg>

// Opción 3: Usar emoji o texto
<span className="logo-text">TuMarca</span>
```

## 4. Cambiar Información de Contacto

### Footer

Edita [frontend/src/components/Footer.jsx](frontend/src/components/Footer.jsx):

```jsx
<p>Email: info@tunegocio.com</p>
<p>Teléfono: +57 300 000 0000</p>
```

### Email de Confirmación

Edita [backend/services/emailService.js](backend/services/emailService.js):

```javascript
// Cambiar remitente
from: process.env.EMAIL_FROM,

// Cambiar asunto
subject: `Tu Asunto Personalizado`,
```

## 5. Cambiar Horarios de Disponibilidad

### Backend

Edita [backend/routes/bookingRoutes.js](backend/routes/bookingRoutes.js):

```javascript
function generateTimeSlots() {
  const slots = [];
  for (let i = 8; i < 18; i++) {  // 8 AM a 6 PM
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
}

// Cambiar a:
for (let i = 9; i < 17; i++) {  // 9 AM a 5 PM
```

## 6. Cambiar Duración de Asesorías

### Backend

Edita [backend/services/calendarService.js](backend/services/calendarService.js):

```javascript
const endTime = new Date(startTime);
endTime.setHours(endTime.getHours() + 1);  // 1 hora

// Cambiar a:
endTime.setHours(endTime.getHours() + 2);  // 2 horas
```

## 7. Agregar Más Estadísticas en Hero

### Editar Hero Section

[frontend/src/components/Hero.jsx](frontend/src/components/Hero.jsx):

```jsx
<div className="hero-stats">
  <div className="stat">
    <div className="stat-number">+200</div>
    <div className="stat-text">Clientes Satisfechos</div>
  </div>
  {/* Agregar más estadísticas */}
</div>
```

## 8. Cambiar Moneda/Zona Horaria

### Frontend

[frontend/src/components/BookingModal.jsx](frontend/src/components/BookingModal.jsx):

```javascript
const formattedDate = new Date(date).toLocaleDateString('es-ES', {
  // Cambiar es-ES a tu idioma
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### Backend

[backend/services/calendarService.js](backend/services/calendarService.js):

```javascript
timeZone: 'America/Bogota'  // Cambiar a tu zona horaria

// Opciones: America/New_York, Europe/Madrid, America/Mexico_City, etc.
```

## 9. Cambiar Iconos

Usamos React Icons. Ver todas las opciones:
- FiCheck, FiX, FiCalendar - Feather Icons
- BiCheck, BiArrow - Remix Icons
- AiCheck, AiArrow - Ant Design Icons

[Explora más iconos](https://react-icons.github.io/react-icons/)

Ejemplo:
```jsx
import { FiCalendar } from 'react-icons/fi'
// Cambiar a:
import { BiCalendar } from 'react-icons/bi'
```

## 10. Agregar/Eliminar Secciones

### Agregar Nueva Sección

1. Crear archivo en `frontend/src/components/NewSection.jsx`:
```jsx
import React from 'react'
import './NewSection.css'

function NewSection() {
  return (
    <section className="new-section">
      {/* Tu contenido */}
    </section>
  )
}

export default NewSection
```

2. Editar [frontend/src/App.jsx](frontend/src/App.jsx):
```jsx
import NewSection from './components/NewSection'

// En el return:
<NewSection />
```

3. Crear `frontend/src/components/NewSection.css` con estilos

### Eliminar Sección

1. Eliminar import en App.jsx
2. Eliminar componente en el return
3. Eliminar carpeta del componente

## 11. Cambiar Tipos de Asesorías

Puedes extender el modelo para soportar diferentes tipos:

**Backend** - Editar [backend/models/Booking.js](backend/models/Booking.js):
```javascript
consultationType: {
  type: String,
  enum: ['general', 'seo', 'social-media', 'email-marketing'],
  default: 'general'
}
```

**Frontend** - Agregar selector en BookingModal.jsx

## 12. Cambiar Cantidad de Pasos en Modal

En [frontend/src/components/BookingModal.jsx](frontend/src/components/BookingModal.jsx):

Cambiar:
```jsx
const [step, setStep] = useState('form')
```

A:
```jsx
const [step, setStep] = useState('step1') // step1, step2, step3, etc
```

## 13. Personalizar Email de Confirmación

Edita [backend/services/emailService.js](backend/services/emailService.js):

```html
<div class="header">
  <h1>Tu Título Aquí</h1>
</div>

<!-- Cambiar contenido HTML según necesites -->
```

## 14. Agregar Social Media

En [frontend/src/components/Footer.jsx](frontend/src/components/Footer.jsx):

```jsx
<div className="social-links">
  <a href="https://facebook.com/tuempresa">
    <FiFacebook />
  </a>
  <a href="https://instagram.com/tuempresa">
    <FiInstagram />
  </a>
</div>
```

## 15. Cambiar Dominio de Email

En [backend/.env](.env):

```env
# De:
EMAIL_FROM=noreply@stivenads.com

# A:
EMAIL_FROM=noreply@tunegocio.com
```

## 16. Agregar Analytics

### Google Analytics

[frontend/src/main.jsx](frontend/src/main.jsx):

```jsx
// Agregar antes de ReactDOM.render
import ReactGA from 'react-ga';
ReactGA.initialize('GA_ID');
```

### Mixpanel

Similar a Google Analytics, puedes agregar en main.jsx

## 17. Cambiar Duración de Animaciones

Edita [frontend/src/index.css](frontend/src/index.css):

```css
--transition: all 0.3s ease;  /* Cambiar 0.3s a 0.5s, 0.1s, etc */
```

## 18. Cambiar Diseño de Botones

Edita los archivos CSS de cada componente:

```css
.btn-primary {
  background: var(--color-yellow);
  border-radius: 8px;    /* Cambiar a 50px para rounded, 0 para square */
  padding: 1rem 2.5rem;  /* Cambiar espaciado */
}
```

## 19. Agregar Política de Privacidad

Crear página nueva:
`frontend/src/components/Privacy.jsx`

Añadir ruta en App.jsx si usas React Router

## 20. Cambiar Cantidad de Campos en Formulario

En [frontend/src/components/BookingModal.jsx](frontend/src/components/BookingModal.jsx):

Agregar campo:
```jsx
<div className="form-group">
  <label>Tu Nuevo Campo</label>
  <input
    type="text"
    name="newField"
    value={formData.newField}
    onChange={handleFormChange}
  />
</div>
```

Actualizar estado:
```jsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  newField: ''  // Agregar aquí
})
```

---

## Estructura de Archivos Importantes

```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero.jsx           ← Cambiar título/descripción
│   │   ├── Problems.jsx       ← Cambiar problemas
│   │   ├── Solutions.jsx      ← Cambiar soluciones
│   │   ├── Footer.jsx         ← Cambiar contacto
│   │   ├── Logo.jsx           ← Cambiar logo
│   │   └── FAQ.jsx            ← Cambiar preguntas
│   └── index.css              ← Cambiar colores

backend/
├── models/
│   └── Booking.js             ← Agregar campos
├── services/
│   └── emailService.js        ← Personalizar email
└── .env                        ← Cambiar credenciales
```

## Checklist de Personalización

- [ ] Cambiar colores de marca
- [ ] Cambiar textos principales
- [ ] Actualizar logo
- [ ] Cambiar información de contacto
- [ ] Personalizar email de confirmación
- [ ] Ajustar horarios de disponibilidad
- [ ] Cambiar zona horaria
- [ ] Agregar/eliminar secciones
- [ ] Personalizar FAQ
- [ ] Agregar social media
- [ ] Cambiar nombre de la empresa
- [ ] Actualizar estadísticas

---

**Recuerda:** Después de cualquier cambio, reinicia los servidores (Ctrl+C y npm run dev)
