# 🎯 Guía de Uso - Modal de Aplicación Piloto Actualizado

## Descripción General
El **PilotApplicationModal** ahora incluye:
- ✅ 6 preguntas de calificación optimizadas
- ✅ Calendario minimalista (60% más pequeño)
- ✅ Pantalla de éxito con fuegos artificiales (confeti)
- ✅ Diseño consistente (colores: #1a2844, #fbbf24, #ffffff)

---

## 🎨 Componentes Principales

### 1. PilotApplicationModal.jsx
**Propósito**: Orquesta el flujo completo de 6 preguntas → formulario → calendario/disqualificación → éxito

**Props**:
```jsx
<PilotApplicationModal onClose={() => {}} />
```

**Estados**:
- `step`: Posición en el flujo (0-5 = preguntas, 5 = formulario, 'success' = completado)
- `responses`: Respuestas a las 6 preguntas
- `formData`: {name, email, phone}
- `qualificationResult`: 'qualified' | 'disqualified' | null
- `selectedDate`: ISO string (fecha seleccionada)
- `selectedTime`: HH:MM (hora seleccionada)

---

### 2. MinimalCalendar.jsx
**Propósito**: Calendario ultra-compacto para seleccionar fecha

**Props**:
```jsx
<MinimalCalendar 
  onDateSelect={(dateString) => setSelectedDate(dateString)} 
  selectedDate={selectedDate}
/>
```

**Características**:
- Mes con navegación (prev/next)
- Pulsing indicator en hoy
- Desactiva fechas pasadas (solo mañana en adelante)
- Tamaño ultra-compacto (cabe en modal)

**Estilos Clave**:
```css
.minimal-calendar {
  padding: 2px;
  font-size: 0.45rem (días);
  gaps: 0.5px;
}
```

---

### 3. SuccessConfetti.jsx
**Propósito**: Pantalla fullscreen de celebración con confeti

**Props**:
```jsx
<SuccessConfetti 
  selectedDate={selectedDate}      // ISO string
  selectedTime={selectedTime}      // HH:MM
  formData={formData}              // {name, email, phone}
/>
```

**Características**:
- Confeti animado (3 segundos)
- Mensaje de agradecimiento
- Detalles de la reunión
- Animaciones smooth (slideInUp, popIn)

---

## 🔄 Flujo de Datos

```
USUARIO ABRE MODAL
    ↓
step = 0 (Pregunta 1: ¿Eres abogado laboralista?)
    ↓
[Usuario responde 6 preguntas]
    ↓
step = 5 (Formulario: Nombre, Email, Teléfono)
    ↓
[Usuario completa formulario y haz click "Enviar"]
    ↓
checkQualification() revisa respuestas:
    ├─ Q1 = "No" → DISQUALIFIED ❌
    ├─ Q3 = "0–10" → DISQUALIFIED ❌
    ├─ Q4 = "No" → DISQUALIFIED ❌
    ├─ Q5 = "Menos de $1.000.000" → DISQUALIFIED ❌
    └─ Caso contrario → QUALIFIED ✅
    ↓
    ├─ Si DISQUALIFIED:
    │   qualificationResult = 'disqualified'
    │   Mostrar: Pantalla de no calificación
    │   Botón: Cerrar
    │
    └─ Si QUALIFIED:
        qualificationResult = 'qualified'
        Mostrar: Calendario minimalista
        Usuario selecciona fecha + hora
        Botón: "Confirmar Reunión"
        ↓
        CLICK → step = 'success'
        ↓
        SuccessConfetti renderiza
        Confeti 3 segundos 🎉
        Detalles de reunión mostrados
```

---

## 📋 Las 6 Preguntas

| # | Pregunta | Tipo | Opciones | Disqualifica Si |
|---|----------|------|----------|-----------------|
| 1 | ¿Eres abogado laboralista? | Binary | Sí/No | **No** |
| 2 | ¿Trabajas con cuota litis? | Dropdown | Sí/Parcialmente/No | — |
| 3 | ¿Cuántas consultas mensuales recibes? | Dropdown | 0–10 / 10–30 / 30–100 / +100 | **0–10** |
| 4 | ¿Estás dispuesto a invertir en publicidad digital? | Binary | Sí/No | **No** |
| 5 | ¿Cuál es tu presupuesto mensual para publicidad? | Dropdown | <$1M / $1M–$2M / $2M–$5M / >$5M | **<$1M** |
| 6 | ¿Cuál es su mayor problema con esas consultas? | Multiple | Muchas no califican / Empresas sin capacidad de pago / Casos de cuantía muy baja / Falta de tiempo para evaluarlas / Otro problema operativo | — |

---

## 🎬 Calendario - Slots de Tiempo

**Horario Disponible**: 9:00 AM - 5:00 PM

**Slots** (cada 30 minutos):
```
09:00, 09:30, 10:00, 10:30, 11:00, 11:30,
14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00
```

**Total**: 13 slots disponibles

---

## 🎨 Esquema de Colores

| Uso | Color | Hex |
|-----|-------|-----|
| Fondo | Navy | #1a2844 |
| Acento Principal | Amarillo | #fbbf24 |
| Texto | Blanco | #ffffff |
| Botón Secundario | Gris | #3a4d6a |
| Éxito | Verde | #22c55e |
| Alerta | Naranja | #f59e0b |

---

## 📱 Responsive Design

- **Desktop** (700px+): Tamaño completo
- **Tablet** (480px): Optimizado para tablets
- **Mobile** (360px): Compacto y usable

---

## 🚀 Cómo Usar en tu App

```jsx
import PilotApplicationModal from './components/PilotApplicationModal'

export default function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Aplicar al Programa Piloto
      </button>

      {showModal && (
        <PilotApplicationModal onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
```

---

## 🧪 Testing Manual

### Caso 1: Usuario NO Calificado
1. Pregunta 1 → Responde "No"
2. Completa resto de preguntas
3. Completa formulario
4. Haz click "Enviar"
5. Deberías ver: "No calificas para este programa"

### Caso 2: Usuario Calificado
1. Pregunta 1 → Responde "Sí"
2. Pregunta 3 → Responde "+100"
3. Pregunta 4 → Responde "Sí"
4. Pregunta 5 → Responde ">$5M"
5. Completa resto de preguntas y formulario
6. Haz click "Enviar"
7. Aparecerá calendario
8. Selecciona fecha y hora
9. Haz click "Confirmar Reunión"
10. Deberías ver: ¡Confeti! 🎉 + Detalles de reunión

---

## 📦 Dependencias

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.x",
    "react-icons": "^4.x",
    "axios": "^1.x",
    "canvas-confetti": "^1.x"
  }
}
```

---

## 🐛 Troubleshooting

**P: El calendario no aparece**
- A: Verifica que `qualificationResult === 'qualified'`

**P: El confeti no funciona**
- A: Asegúrate que `canvas-confetti` está instalado: `npm install canvas-confetti`

**P: Los colores no se ven correctamente**
- A: Verifica que los estilos CSS tienen `!important` flags

**P: Los slots de tiempo no aparecen**
- A: Verifica que `selectedDate !== null`

---

## 📞 API Integration

**Endpoint**: `POST /api/leads/apply-pilot`

**Payload esperado**:
```json
{
  "name": "Javier Gómez",
  "email": "javier@example.com",
  "phone": "+57 300 123 4567",
  "is_labor_lawyer": "Sí",
  "works_quota_litis": "Sí",
  "monthly_consultations": "+100",
  "willing_to_invest_ads": "Sí",
  "ads_budget_range": ">$5M",
  "main_problem": ["Muchas no califican", "Otro problema operativo"],
  "selected_date": "2026-01-24",
  "selected_time": "14:00"
}
```

---

## ✅ Checklist Pre-Deploy

- [ ] npm install canvas-confetti
- [ ] npm run build (sin errores)
- [ ] Testear flujo completo en navegador
- [ ] Verificar responsive en mobile
- [ ] Backend API `/api/leads/apply-pilot` listo
- [ ] Email de confirmación configurado
- [ ] Google Calendar integration (si aplica)

---

**Última actualización**: 16 de Enero, 2026
**Versión**: 2.0 (Con Confeti)
