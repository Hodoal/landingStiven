# 🚀 PRÓXIMOS PASOS - Integración Frontend

## 📋 Resumen de la Actualización

El sistema de disponibilidad ha sido actualizado para funcionar con **HORAS específicas** en lugar de días completos.

**Archivos creados:**
- ✅ `backend/models/Consultant.js` - Modelo de consultores
- ✅ `backend/services/availabilityService.js` - Lógica de disponibilidad
- ✅ `backend/routes/consultantRoutes.js` - Endpoints API
- ✅ `scripts/seedConsultants.js` - Crear ejemplos
- ✅ `AVAILABILITY_GUIDE.md` - Documentación completa

**Archivos modificados:**
- ✅ `backend/server.js` - Agregada ruta de consultores

---

## 🔄 PASO 1: Crear Datos de Ejemplo

```bash
cd /Users/javier/Desktop/landing_stiven
node scripts/seedConsultants.js
```

Esto crea 3 consultores con horarios variados:
- Dr. Juan García (Lunes-Viernes: 09:00-12:00, 14:00-18:00)
- Lic. María López (Mar-Sáb: 10:00-13:00, 15:00-19:00)
- Ing. Carlos Rodríguez (Lun-Jue: 08:00-12:00, 13:00-17:00)

---

## 🧪 PASO 2: Probar Backend

### Verificar conectividad
```bash
curl http://localhost:3001/api/consultants
```

### Obtener horarios para una fecha
```bash
curl "http://localhost:3001/api/consultants/{CONSULTANT_ID}/available-times?date=2025-01-20&duration=60"
```

---

## 🎨 PASO 3: Actualizar Frontend

### A. Crear Componente de Selector de Consultores

Archivo: `frontend/src/components/ConsultantSelector.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import './ConsultantSelector.css';

export default function ConsultantSelector({ onSelect }) {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener lista de consultores
    fetch('http://localhost:3001/api/consultants')
      .then(r => r.json())
      .then(data => {
        setConsultants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching consultants:', err);
        setLoading(false);
      });
  }, []);

  const handleSelectConsultant = (consultant) => {
    setSelectedConsultant(consultant);
    onSelect(consultant);
  };

  if (loading) return <div>Cargando consultores...</div>;

  return (
    <div className="consultant-selector">
      <h3>Selecciona un Consultor</h3>
      <div className="consultant-grid">
        {consultants.map(consultant => (
          <div
            key={consultant._id}
            className={`consultant-card ${selectedConsultant?._id === consultant._id ? 'selected' : ''}`}
            onClick={() => handleSelectConsultant(consultant)}
          >
            <div className="consultant-image">
              <img src={consultant.profileImage || 'https://via.placeholder.com/150'} alt={consultant.name} />
            </div>
            <h4>{consultant.name}</h4>
            <p className="specialization">{consultant.specialization}</p>
            {consultant.bio && <p className="bio">{consultant.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### B. Crear Componente de Selector de Horas

Archivo: `frontend/src/components/TimeSlotSelector.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import './TimeSlotSelector.css';

export default function TimeSlotSelector({ consultantId, selectedDate, onSelect }) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (!consultantId || !selectedDate) return;

    setLoading(true);

    // Obtener horarios disponibles para la fecha
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`http://localhost:3001/api/consultants/${consultantId}/available-times?date=${dateStr}&duration=60`)
      .then(r => r.json())
      .then(data => {
        setAvailableTimes(data.availableTimes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching times:', err);
        setLoading(false);
      });
  }, [consultantId, selectedDate]);

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    onSelect(time);
  };

  if (loading) return <div>Cargando horarios...</div>;
  if (availableTimes.length === 0) return <div>No hay horarios disponibles</div>;

  return (
    <div className="time-slot-selector">
      <h3>Selecciona una Hora</h3>
      <div className="time-grid">
        {availableTimes.map((slot, index) => (
          <button
            key={index}
            className={`time-slot ${selectedTime?.startTime === slot.startTime ? 'selected' : ''}`}
            onClick={() => handleSelectTime(slot)}
          >
            {slot.startTime}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### C. Actualizar Componente de Booking

Actualiza el formulario de booking existente para:

1. Mostrar selector de consultores
2. Mostrar selector de horarios (basado en consultor y fecha)
3. Guardar `consultantId` en el booking

```javascript
// En tu componente de BookingForm.jsx

import ConsultantSelector from './ConsultantSelector';
import TimeSlotSelector from './TimeSlotSelector';

export default function BookingForm() {
  const [formData, setFormData] = useState({...});
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleConsultantSelect = (consultant) => {
    setSelectedConsultant(consultant);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedConsultant) {
      alert('Por favor selecciona un consultor');
      return;
    }

    if (!selectedTime) {
      alert('Por favor selecciona un horario');
      return;
    }

    const bookingData = {
      ...formData,
      date: formData.date,
      time: selectedTime.startTime,
      consultantId: selectedConsultant._id,
      durationMinutes: 60
    };

    try {
      const response = await fetch('http://localhost:3001/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        alert('¡Booking confirmado!');
        // Redirigir o limpiar formulario
      } else {
        alert('Error al crear booking');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear booking');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ConsultantSelector onSelect={handleConsultantSelect} />

      {selectedConsultant && (
        <TimeSlotSelector
          consultantId={selectedConsultant._id}
          selectedDate={new Date(formData.date)}
          onSelect={handleTimeSelect}
        />
      )}

      {/* Resto del formulario */}
    </form>
  );
}
```

---

## 🎨 PASO 4: Crear Estilos CSS

Archivo: `frontend/src/components/ConsultantSelector.css`

```css
.consultant-selector {
  margin: 20px 0;
}

.consultant-selector h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #ffeb3b;
}

.consultant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.consultant-card {
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.consultant-card:hover {
  border-color: #ffeb3b;
  transform: translateY(-5px);
  background: #333;
}

.consultant-card.selected {
  border-color: #ffeb3b;
  background: #3a3a2a;
}

.consultant-image {
  width: 100%;
  margin-bottom: 10px;
}

.consultant-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.consultant-card h4 {
  margin: 10px 0 5px;
  color: #fff;
  font-size: 1rem;
}

.consultant-card .specialization {
  color: #ffeb3b;
  font-size: 0.9rem;
  margin: 5px 0;
}

.consultant-card .bio {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.3;
  margin-top: 8px;
}
```

Archivo: `frontend/src/components/TimeSlotSelector.css`

```css
.time-slot-selector {
  margin: 20px 0;
}

.time-slot-selector h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #ffeb3b;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.time-slot {
  background: #2a2a2a;
  border: 2px solid #444;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 500;
}

.time-slot:hover {
  border-color: #ffeb3b;
  background: #333;
}

.time-slot.selected {
  background: #ffeb3b;
  color: #1a1a1a;
  border-color: #ffeb3b;
}

.time-slot:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 🔗 PASO 5: Integrar en Página de Booking

Actualiza tu página de booking principal para importar y usar los nuevos componentes.

---

## 📊 PASO 6: Actualizar Modelo de Booking

Asegúrate de que el modelo `Booking.js` tiene estos campos:

```javascript
{
  // Campos existentes...
  
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant'
  },
  
  assignedConsultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant'
  },
  
  durationMinutes: {
    type: Number,
    default: 60,
    min: 15,
    max: 480
  }
}
```

---

## 🧪 PASO 7: Pruebas

### Test 1: Crear Booking
```bash
curl -X POST http://localhost:3001/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "date": "2025-01-20",
    "time": "10:00",
    "durationMinutes": 60,
    "consultantId": "YOUR_CONSULTANT_ID"
  }'
```

### Test 2: Verificar Conflictos
Intenta agendar a la misma hora - debe fallar con error de conflicto.

---

## ✅ Checklist de Implementación

- [ ] Crear consultores de ejemplo (`node scripts/seedConsultants.js`)
- [ ] Verificar endpoint `/api/consultants` retorna datos
- [ ] Crear componente `ConsultantSelector.jsx`
- [ ] Crear componente `TimeSlotSelector.jsx`
- [ ] Crear archivos CSS
- [ ] Integrar componentes en página de booking
- [ ] Actualizar modelo de Booking
- [ ] Probar flujo completo de reserva
- [ ] Probar detección de conflictos
- [ ] Validar con múltiples consultores

---

## 🚀 Una Vez Completado

El sistema estará totalmente funcional con:
- ✅ Listado de consultores disponibles
- ✅ Horarios disponibles por consultor y fecha
- ✅ Detección automática de conflictos
- ✅ Múltiples reuniones por día sin superposición
- ✅ Break time configurado
- ✅ Interfaz amigable en frontend

---

## 📚 Documentación Referencia

Para más detalles técnicos:
- `AVAILABILITY_GUIDE.md` - Guía completa de API
- `AVAILABILITY_UPDATE.md` - Cambios realizados
- `backend/models/Consultant.js` - Estructura del modelo
- `backend/services/availabilityService.js` - Lógica de disponibilidad

---

**¡Listo para integrar el frontend!** 🎉
