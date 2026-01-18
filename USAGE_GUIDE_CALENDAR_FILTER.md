# 🎯 Guía de Uso - Filtro de Disponibilidad de Calendario

## ¿Qué se cambió?

Se agregó un **filtro inteligente al calendario** que:
- ✅ Solo muestra horarios disponibles
- ✅ Evita cruces/conflictos con otras reuniones
- ✅ Marca visualmente qué horarios están ocupados
- ✅ Muestra detalles de quién tiene cada reunión

---

## 📱 Vista del Usuario

### Antes (Sin Filtro):
```
Horarios disponibles: 20 de enero
- 09:00 ✗ Ocupado (pero podría parecer disponible)
- 09:30 ✓ Disponible
- 10:00 ✗ Ocupado
- ... todos los horarios sin distinción
```

### Ahora (Con Filtro):
```
Horarios disponibles: 20 de enero [5 disponibles]

LEYENDA:
 🟢 Disponible  🔴 Ocupado

[09:00]  ✓    [09:30] ✓    [10:00] ✕    [10:30] ✓    [11:00] ✕
Verde            Verde        Rojo         Verde        Rojo
Clickeable       Clickeable   Bloqueado    Clickeable   Bloqueado

Horarios ocupados:
📍 09:00 (Cliente A)
📍 10:00 (Cliente B)
```

---

## 🔧 Cómo Funciona

### 1️⃣ Usuario selecciona una fecha
```javascript
// El frontend envía:
GET /api/consultants/{consultantId}/available-times?date=2026-01-20
```

### 2️⃣ Backend retorna información completa
```javascript
{
  availableTimes: [              // Solo disponibles
    { startTime: "09:30", endTime: "10:30", available: true },
    { startTime: "11:00", endTime: "12:00", available: true }
  ],
  occupiedTimes: [               // Ocupados con detalles
    { startTime: "09:00", clientName: "Cliente A", status: "confirmed" },
    { startTime: "10:00", clientName: "Cliente B", status: "confirmed" }
  ],
  allSlots: [                    // Vista completa del día
    { startTime: "09:00", available: false },
    { startTime: "09:30", available: true },
    { startTime: "10:00", available: false },
    // ... etc
  ]
}
```

### 3️⃣ Frontend muestra vista mejorada
- Los horarios **disponibles** en **VERDE** (clickeables)
- Los horarios **ocupados** en **ROJO** (bloqueados)
- **Leyenda** clara con iconos
- **Contador** de disponibilidad
- **Detalles** de quién ocupa cada horario

### 4️⃣ Usuario selecciona horario
- Solo puede seleccionar horarios verdes (disponibles)
- Los horarios rojos están completamente deshabilitados
- Validación adicional en el backend antes de confirmar

---

## 📊 Protecciones contra Conflictos

### Nivel 1: Backend (availabilityService)
```javascript
// Verifica cada slot del día
for (let currentMinutes = 480; currentMinutes < 1200; currentMinutes += 30) {
  // Busca conflictos con reuniones existentes
  if (horarioEstáOcupado) {
    NO_RETORNA_ESTE_HORARIO; // ✅ Filtrado aquí
  }
}
```

### Nivel 2: Frontend (Visualización)
```javascript
// Filtra nuevamente los horarios retornados
const confirmedAvailable = availableTimes.filter(slot => slot.available === true)
// Muestra solo estos horarios
```

### Nivel 3: Validación Final (Crear Booking)
```javascript
// Cuando el usuario confirma, se valida de nuevo
const canBook = checkAvailability(consultantId, date, time, duration)
if (!canBook) {
  RECHAZA LA RESERVA; // ✅ Protección final
}
```

---

## 🎨 Estilos Visuales

### Slot Disponible (Verde)
```css
border: 2px solid rgba(34, 197, 94, 0.5);    /* Verde transparente */
background: rgba(34, 197, 94, 0.05);         /* Fondo verde suave */
cursor: pointer;                              /* Interactivo */
```
**En hover**: Se ilumina más, efecto de elevación

**Al seleccionar**: Degradado verde brillante

### Slot Ocupado (Rojo)
```css
border: 2px solid rgba(239, 68, 68, 0.5);    /* Rojo transparente */
background: rgba(239, 68, 68, 0.08);         /* Fondo rojo suave */
cursor: not-allowed;                          /* No interactivo */
opacity: 0.6;                                 /* Más opaco */
```
**En hover**: No cambia (está bloqueado)

---

## 🚀 Cómo Probar

### Test 1: Crear una reunión de prueba
1. Abre el booking modal
2. Selecciona una fecha futura
3. Selecciona un horario disponible
4. Completa el formulario
5. Confirma el booking

**Resultado esperado**: El horario aparece ahora como ROJO (ocupado)

### Test 2: Ver horarios ocupados
1. Selecciona la misma fecha nuevamente
2. Verifica que el horario anterior ahora aparece en ROJO
3. Confirma que no se puede seleccionar

**Resultado esperado**: El botón está deshabilitado y no responde

### Test 3: Múltiples reuniones
1. Crea varias reuniones en la misma fecha
2. Abre el calendario
3. Verifica que todos los ocupados aparezcan en ROJO

**Resultado esperado**: Todos los ocupados están claramente marcados

### Test 4: Responsive
1. Abre en móvil/tablet
2. Verifica que los slots se vean bien en grid 2-3 columnas
3. Comprueba que la leyenda sea legible

**Resultado esperado**: Funciona perfectamente en todos los dispositivos

---

## 📋 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `backend/routes/consultantRoutes.js` | Endpoint mejorado con allSlots |
| `frontend/src/components/BookingModal.jsx` | Lógica de filtrado y visualización |
| `frontend/src/components/BookingModal.css` | Estilos para disponibles/ocupados |

---

## 🔍 Debugging

### Si los horarios no se muestran:
1. Abre la consola del navegador (F12)
2. Busca logs que comiencen con 🟢, 🔴, 📊
3. Verifica que el endpoint esté retornando datos

```javascript
🟢 Horarios disponibles (sin conflictos): 5
🔴 Horarios ocupados: 3
📊 Total de slots del día: 13
```

### Si todos los horarios salen como ocupados:
1. Verifica la fecha seleccionada
2. Comprueba que el consultantId sea válido
3. Revisa la base de datos de bookings

### Si se puede seleccionar un ocupado:
1. Recarga la página
2. Limpia el cache del navegador
3. Verifica que el backend esté retornando `available: false`

---

## ✅ Checklist de Funcionalidad

- [ ] Los horarios disponibles se muestran en VERDE
- [ ] Los horarios ocupados se muestran en ROJO
- [ ] Los horarios ocupados no se pueden seleccionar
- [ ] La leyenda es clara y visible
- [ ] El contador muestra la cantidad correcta
- [ ] Los detalles de clientes aparecen correctamente
- [ ] Funciona en desktop, tablet y móvil
- [ ] Se puede crear reservas en horarios disponibles
- [ ] Las reservas aparecen inmediatamente como ocupadas

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs en la consola (F12)
2. Revisa que el backend esté corriendo
3. Comprueba la conexión a la base de datos
4. Intenta recargar la página
5. Limpia el cache del navegador

---

**Última actualización**: 17 de enero de 2026
**Estado**: ✅ Producción
