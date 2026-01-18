# 📅 Disponibilidad de Consultores - Guía de Uso

## 🎯 Resumen de la Lógica

La disponibilidad funciona ahora con **HORAS específicas**, no con días completos:

- ✅ Cada consultor tiene disponibilidad por **horas** (ej: 9:00-12:00, 14:00-18:00)
- ✅ Pueden haber **múltiples reuniones en un día**, pero **NO se pueden superponer**
- ✅ Sistema automático de **detección de conflictos**
- ✅ Consideración de **break time** (descanso/almuerzo)

## 📊 Estructura de Datos

### Modelo de Consultor

```javascript
{
  name: "Dr. Juan García",
  email: "juan@example.com",
  specialization: "Marketing Digital",
  
  // Disponibilidad por horas
  availability: {
    "monday": [
      { startTime: "09:00", endTime: "12:00", durationMinutes: 60 },
      { startTime: "14:00", endTime: "18:00", durationMinutes: 60 }
    ],
    "tuesday": [
      { startTime: "09:00", endTime: "12:00", durationMinutes: 60 },
      { startTime: "14:00", endTime: "18:00", durationMinutes: 60 }
    ],
    // ... más días
  },
  
  // Horario de descanso (almuerzo)
  breakTime: {
    startTime: "12:00",
    endTime: "14:00"
  },
  
  // Fechas no disponibles
  unavailableDates: []
}
```

**Explicación:**
- **availability**: Mapa con días de la semana como claves
- **startTime/endTime**: Rango de horas disponibles (formato 24h)
- **durationMinutes**: Duración máxima de la reunión en ese slot
- **breakTime**: Hora de almuerzo (no puede haber reuniones)
- **unavailableDates**: Fechas de vacaciones o no disponibles

---

## 🔌 Endpoints de API

### 1. Obtener Consultores Disponibles

```bash
GET /api/consultants
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Juan García",
    "email": "juan@example.com",
    "specialization": "Marketing Digital",
    "bio": "Especialista en estrategia digital",
    "profileImage": "https://..."
  },
  ...
]
```

---

### 2. Obtener Horarios Disponibles para una Fecha

```bash
GET /api/consultants/:consultantId/available-times?date=2025-01-20&duration=60
```

**Parámetros:**
- `date`: Fecha en formato YYYY-MM-DD
- `duration`: Duración en minutos (default: 60)

**Response:**
```json
{
  "date": "2025-01-20",
  "duration": 60,
  "availableTimes": [
    {
      "startTime": "09:00",
      "endTime": "10:00",
      "available": true
    },
    {
      "startTime": "09:30",
      "endTime": "10:30",
      "available": true
    },
    {
      "startTime": "10:00",
      "endTime": "11:00",
      "available": true
    },
    // ... más horarios disponibles cada 30 minutos
  ]
}
```

**Ejemplo con curl:**
```bash
curl "http://localhost:3001/api/consultants/507f1f77bcf86cd799439011/available-times?date=2025-01-20&duration=60"
```

---

### 3. Obtener Próximos Horarios Disponibles

```bash
GET /api/consultants/:consultantId/next-available?days=30&duration=60
```

**Parámetros:**
- `days`: Número de días a consultar (default: 30)
- `duration`: Duración en minutos (default: 60)

**Response:**
```json
{
  "nextAvailableSlots": [
    {
      "date": "2025-01-20T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "10:00"
    },
    {
      "date": "2025-01-20T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "11:00"
    },
    // ... hasta 15 slots
  ],
  "totalSlots": 42
}
```

**Ejemplo con curl:**
```bash
curl "http://localhost:3001/api/consultants/507f1f77bcf86cd799439011/next-available?days=30&duration=60"
```

---

### 4. Verificar si un Horario Específico está Disponible

```bash
POST /api/consultants/:consultantId/check-availability
Content-Type: application/json

{
  "date": "2025-01-20",
  "startTime": "10:00",
  "duration": 60
}
```

**Response (Disponible):**
```json
{
  "available": true
}
```

**Response (No disponible):**
```json
{
  "available": false,
  "reason": "Conflicto con reunión existente a las 10:30"
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3001/api/consultants/507f1f77bcf86cd799439011/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-20",
    "startTime": "10:00",
    "duration": 60
  }'
```

---

### 5. Crear Nuevo Consultor

```bash
POST /api/consultants
Content-Type: application/json

{
  "name": "Dra. Ana López",
  "email": "ana@example.com",
  "phone": "+34 612 345 678",
  "specialization": "Finanzas",
  "bio": "Especialista en planning financiero",
  "googleCalendarEmail": "ana@gmail.com",
  "availability": {
    "monday": [
      { "startTime": "09:00", "endTime": "12:00", "durationMinutes": 60 }
    ],
    "tuesday": [
      { "startTime": "09:00", "endTime": "12:00", "durationMinutes": 60 }
    ]
    // ... más días
  },
  "breakTime": {
    "startTime": "12:00",
    "endTime": "14:00"
  }
}
```

---

### 6. Actualizar Disponibilidad de un Consultor

```bash
PUT /api/consultants/:consultantId/availability
Content-Type: application/json

{
  "availability": {
    "monday": [
      { "startTime": "08:00", "endTime": "11:00", "durationMinutes": 60 },
      { "startTime": "15:00", "endTime": "18:00", "durationMinutes": 60 }
    ],
    "tuesday": [
      { "startTime": "08:00", "endTime": "11:00", "durationMinutes": 60 }
    ]
    // ... más días
  }
}
```

**Response:**
```json
{
  "message": "Disponibilidad actualizada",
  "availability": { ... }
}
```

---

### 7. Marcar Fechas No Disponibles (Vacaciones, etc.)

```bash
PUT /api/consultants/:consultantId
Content-Type: application/json

{
  "unavailableDates": [
    {
      "toDateString": "2025-01-25",
      "description": "Vacaciones"
    },
    {
      "toDateString": "2025-01-26",
      "description": "Vacaciones"
    }
  ]
}
```

---

## 🔄 Flujo Completo de Agendamiento

### Paso 1: Cliente solicita disponibilidad

```bash
# Cliente va a página de booking
# Frontend obtiene consultores disponibles
GET /api/consultants

# Frontend muestra selector de consultores
```

### Paso 2: Cliente selecciona consultor y fecha

```bash
# Frontend obtiene horarios disponibles para esa fecha
GET /api/consultants/{consultantId}/available-times?date=2025-01-20&duration=60

# Se muestra lista de horas disponibles: 09:00, 09:30, 10:00, etc.
```

### Paso 3: Cliente elige hora y crea booking

```bash
# Frontend verifica disponibilidad antes de crear booking
POST /api/consultants/{consultantId}/check-availability
{
  "date": "2025-01-20",
  "startTime": "10:00",
  "duration": 60
}

# Si es disponible (available: true), crear booking
POST /api/booking
{
  "clientName": "John Doe",
  "email": "john@example.com",
  "date": "2025-01-20",
  "time": "10:00",
  "durationMinutes": 60,
  "consultantId": "507f1f77bcf86cd799439011",
  ...
}
```

### Paso 4: Sistema asigna consultor

```bash
# Backend asigna automáticamente o admin asigna
POST /api/consultants/{consultantId}/assign-booking
{
  "bookingId": "507f191e810c19729de860ea"
}

# Sistema verifica conflictos automáticamente
# Si hay conflicto, rechaza la asignación
```

---

## 🚫 Detección de Conflictos

El sistema detecta automáticamente:

1. **Conflictos de horario**: Si hay 2 reuniones que se superponen
2. **Break time**: Si intenta agendar durante almuerzo
3. **Días no disponibles**: Si está marcado como no disponible
4. **Consultor inactivo**: Si el consultor está desactivado

**Ejemplo:**
```
Consultor Juan García:
- Disponibilidad: 09:00-12:00, 14:00-18:00
- Break time: 12:00-14:00
- Reunión 1: 10:00-11:00 ✅ CONFIRMADA

Intento de agendar:
- Hora: 10:30-11:30 ❌ CONFLICTO (se superpone con reunión 1)
- Hora: 11:00-12:00 ✅ DISPONIBLE (cabe antes del break)
- Hora: 13:00-14:00 ❌ CONFLICTO (es break time)
- Hora: 14:00-15:00 ✅ DISPONIBLE
```

---

## 🛠️ Mantenimiento

### Crear Consultores de Ejemplo

```bash
cd /Users/javier/Desktop/landing_stiven
node scripts/seedConsultants.js
```

### Actualizar Horarios

```javascript
// Via API o directamente en base de datos
await Consultant.findByIdAndUpdate(consultantId, {
  availability: {
    monday: [
      { startTime: "09:00", endTime: "13:00", durationMinutes: 60 }
    ]
  }
});
```

---

## 📱 Ejemplo Frontend

```javascript
// React component para selector de horarios

const [selectedDate, setSelectedDate] = useState('2025-01-20');
const [selectedConsultant, setSelectedConsultant] = useState(null);
const [availableTimes, setAvailableTimes] = useState([]);

// Obtener horarios cuando cambia fecha o consultor
useEffect(() => {
  if (selectedConsultant && selectedDate) {
    fetch(`/api/consultants/${selectedConsultant}/available-times?date=${selectedDate}&duration=60`)
      .then(r => r.json())
      .then(data => setAvailableTimes(data.availableTimes));
  }
}, [selectedDate, selectedConsultant]);

// Agendar
const handleBook = async (startTime) => {
  const response = await fetch('/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: formData.name,
      email: formData.email,
      date: selectedDate,
      time: startTime,
      durationMinutes: 60,
      consultantId: selectedConsultant
    })
  });

  if (response.ok) {
    alert('¡Booking confirmado!');
  }
};
```

---

## 💡 Notas Importantes

1. **Formato de horas**: Siempre HH:MM en formato 24 horas
2. **Duración mínima**: Recomendado 60 minutos
3. **Intervalos**: Frontend genera slots cada 30 minutos
4. **Conflictos**: El sistema detecta automáticamente
5. **Break time**: No se pueden agendar reuniones durante este período
6. **Consultor desactivo**: No aparece en búsquedas

---

## 🎓 Ejemplos de Casos de Uso

### Caso 1: Consultor con horario partido

```javascript
availability: {
  monday: [
    { startTime: "09:00", endTime: "12:00", durationMinutes: 60 }, // Mañana
    { startTime: "14:00", endTime: "18:00", durationMinutes: 60 }  // Tarde
  ]
}
breakTime: {
  startTime: "12:00",
  endTime: "14:00"
}

// Disponibles a las 09:00, 09:30, 10:00, 10:30, 11:00, 14:00, 14:30, ...
```

### Caso 2: Consultor con horario diferente cada día

```javascript
availability: {
  monday: [{ startTime: "09:00", endTime: "12:00", durationMinutes: 60 }],
  tuesday: [{ startTime: "14:00", endTime: "18:00", durationMinutes: 60 }],
  wednesday: [{ startTime: "09:00", endTime: "13:00", durationMinutes: 60 }],
  thursday: [],  // No disponible
  friday: [{ startTime: "10:00", endTime: "14:00", durationMinutes: 60 }]
}
```

### Caso 3: Detectar conflicto

```javascript
// Reunión existente: 10:00-11:00
// Intento de agendar: 10:30-11:30
// Resultado: ❌ CONFLICTO (se superponen 10:30-11:00)

// Intento de agendar: 11:00-12:00
// Resultado: ✅ DISPONIBLE (comienza cuando termina la otra)
```

---

**¡Listo! El sistema de disponibilidad ahora funciona con horas específicas y detecta conflictos automáticamente.**
