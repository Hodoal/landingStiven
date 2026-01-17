# 📋 Sistema de Agendamiento - Prueba Piloto

## Implementación Completada

### 🎯 Objetivo
Sistema de aplicación a prueba piloto con 6 preguntas de validación automática, clasificación de leads y tracking de eventos.

---

## 📦 Componentes Creados

### Frontend

#### 1. **PilotApplicationModal.jsx**
- Modal con 6 preguntas secuenciales
- Validación de descarte automático en tiempo real
- Soporte para preguntas binarias, de opción única y múltiple
- Tracking de eventos (form_submitted, form_disqualified)
- Animaciones con Framer Motion

**Ubicación:** `/frontend/src/components/PilotApplicationModal.jsx`

**Ubicación CSS:** `/frontend/src/components/PilotApplicationModal.css`

#### 2. **Actualización de App.jsx**
- Nuevo estado `showPilotModal` para manejar la visibilidad del modal
- Se abre desde Header, Hero, FloatingButton, CTA, etc.
- Reemplaza el anterior BookingModal

#### 3. **utils/api.js**
- Configuración centralizada de endpoints
- Soporte para variables de entorno VITE_API_URL

---

## 🔧 Backend

### Rutas Nuevas

#### POST `/api/leads/apply-pilot`
Recibe los datos del formulario y valida automáticamente.

**Request Body:**
```json
{
  "is_labor_lawyer": "Sí" | "No",
  "works_quota_litis": "Sí" | "Parcialmente" | "No",
  "monthly_consultations": "0–10" | "10–30" | "30–60" | "60+",
  "willing_to_invest_ads": "Sí" | "No",
  "ads_budget_range": "Menos de $1.000.000" | "$1.000.000 – $2.000.000" | "$2.000.000 – $4.000.000" | "Más de $4.000.000",
  "main_problem": ["Muchas no califican", "Empresas sin capacidad de pago", ...]
}
```

**Response (Lead Calificado):**
```json
{
  "success": true,
  "disqualified": false,
  "leadId": "507f1f77bcf86cd799439011",
  "lead_type": "Ideal" | "Scale"
}
```

**Response (Lead Descalificado):**
```json
{
  "success": true,
  "disqualified": true,
  "leadId": "507f1f77bcf86cd799439012",
  "lead_type": null
}
```

#### POST `/api/leads/track-event`
Registra eventos de analytics.

**Request Body:**
```json
{
  "eventName": "form_submitted" | "form_disqualified" | "schedule_completed"
}
```

---

## ✅ Lógica de Validación

### Descarte Automático (Hard Filters)
Se descarta si se cumple **CUALQUIERA** de estas condiciones:

1. ❌ `is_labor_lawyer` = "No"
2. ❌ `monthly_consultations` = "0–10"
3. ❌ `willing_to_invest_ads` = "No"
4. ❌ `ads_budget_range` = "Menos de $1.000.000"

**Mensaje de Descarte:**
```
Gracias por aplicar.

Actualmente este programa está enfocado en abogados laborales con estructura 
de crecimiento y disposición para invertir en captación.

Si abrimos nuevas plazas, lo contactaremos.
```

---

## 🏆 Clasificación Automática de Leads

Solo para leads que **pasan todas las validaciones**:

| monthly_consultations | lead_type |
|---|---|
| 10–30 | **Ideal** |
| 30–60 | **Ideal** |
| 60+ | **Scale** |
| 0–10 | ❌ Descalificado |

**Nota:** `lead_type` se almacena en BD pero **NO** se muestra al usuario.

---

## 📊 Estructura de Datos en MongoDB

```javascript
{
  // Datos de la aplicación
  is_labor_lawyer: Boolean,
  works_quota_litis: String,
  monthly_consultations: String,
  willing_to_invest_ads: Boolean,
  ads_budget_range: String,
  main_problem: [String],  // Array de opciones seleccionadas
  
  // Clasificación y estado
  lead_type: String,  // "Ideal" | "Scale" | null
  status: String,     // "applied" | "disqualified"
  
  // Descalificación
  disqualified_reason: String,
  disqualified_at: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎬 Flujo de Uso

### 1️⃣ Usuario Hace Clic en CTA
```
"Aplicar a la Prueba Piloto"
↓
Se abre PilotApplicationModal
```

### 2️⃣ Modal muestra preguntas secuencialmente
```
Pregunta 1: ¿Ejerce como abogado laboral?
  Sí / No

Pregunta 2: ¿Modelo de cuota de litis?
  Sí / Parcialmente / No

...

Pregunta 6: ¿Cuál es su mayor problema?
  [Múltiple selección]
```

### 3️⃣ Validación en Tiempo Real
- Si selecciona opción de descarte → Muestra mensaje inmediatamente
- No puede continuar

### 4️⃣ Envío del Formulario
```
Usuario hace clic en "Enviar" (después de pregunta 6)
↓
Backend valida automáticamente
↓
¿Descalificado?
  ├─ SÍ → Mensaje de descarte + Guardar como "disqualified"
  └─ NO → Guardar como "applied" + Mostrar mensaje de éxito
```

### 5️⃣ Eventos de Tracking
- ✅ `form_submitted` - Lead calificado
- ❌ `form_disqualified` - Lead descalificado
- 📅 `schedule_completed` - (Posterior: cuando se agenda)

---

## 🚀 Próximos Pasos

### Fase 2: Integración con Calendly
1. Crear página `/schedule` que recibe `leadId`
2. Mostrar calendario de Calendly integrado
3. Guardar `scheduled_at` cuando completa cita
4. Enviar evento a tracking: `schedule_completed`

### Fase 3: WhatsApp Integration
1. Confirmación de cita por WhatsApp
2. Recordatorios 24h antes
3. Follow-up post-llamada

### Fase 4: Admin Dashboard
1. Ver leads clasificados (Ideal / Scale)
2. Filtrar por status (applied / scheduled / sold / disqualified)
3. Cambiar status manualmente
4. Registrar ventas y monto

---

## 🔌 Variables de Entorno

### Frontend
**`.env.local` o `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

### Backend
Usa los endpoints en `/api/leads`

---

## 📝 Cambios en Archivos Existentes

### `/frontend/src/App.jsx`
- Cambió `showModal` por `showPilotModal` y `showBookingModal`
- Agregó import de `PilotApplicationModal`
- Todos los `onBookClick` ahora abren el modal de piloto

### `/backend/models/Lead.js`
- ✅ Modelo ya contenía todos los campos necesarios
- No requirió cambios

### `/backend/routes/leadsRoutes.js`
- ✅ Agregó ruta POST `/apply-pilot`
- ✅ Agregó ruta POST `/track-event`

---

## 🧪 Testing

### Test Manual en Desarrollo

1. **Dev Server Frontend:**
```bash
cd frontend
npm run dev
```

2. **Dev Server Backend:**
```bash
cd backend
npm install
node server.js
```

3. **Abrir en Browser:**
```
http://localhost:5173
```

4. **Hacer clic en "Aplicar a la Prueba Piloto"**

5. **Probar escenarios:**
   - ✅ Caso Ideal (respuestas que califican)
   - ❌ Caso Descalificado (al menos una validación falsa)
   - 📊 Verificar BD para ver leads guardados

### Test en Console
```javascript
// Verificar que se abre el modal
document.querySelector('.pilot-modal-overlay')

// Verificar que el tracking funciona
// Abrir DevTools → Network → buscar "track-event"
```

---

## 📊 Métricas Esperadas

Después de implementar, podrás medir:
- Total de formularios iniciados
- Total completados
- Tasa de descalificación
- Distribución Ideal vs Scale
- Presupuestos más comunes
- Problemas más frecuentes

---

## 🐛 Troubleshooting

### "CORS Error"
Verifica que el backend tiene `cors()` middleware activado.

### "API endpoint not found"
Asegúrate que el server está corriendo en puerto 3001 o el correcto en `.env`.

### "Lead no se guarda"
Verifica conexión a MongoDB y que los campos coinciden con el schema.

---

## 📚 Referencias

- Componentes: Frontend con React + Framer Motion
- API: Express.js con validación en tiempo real
- BD: MongoDB con Mongoose
- Tracking: Meta Pixel + Custom Analytics

---

**Creado:** 2025-01-16
**Última actualización:** 2025-01-16
