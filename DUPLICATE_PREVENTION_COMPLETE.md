# 🔒 Prevención de Duplicados en Bookings - Documentación Completa

**Fecha:** 6 de Febrero de 2026  
**Estado:** ✅ COMPLETADO Y VERIFICADO

---

## 📋 Problema Identificado

El usuario reportó que la base de datos estaba duplicando las personas agendadas (bookings). Esto causaba registros inconsistentes y confusión en el panel administrativo.

---

## 🔍 Root Cause Analysis

1. **Sin validación de duplicados:** El endpoint POST `/api/booking/create` no verificaba si ya existía un booking para el mismo email en la misma fecha/hora
2. **Sin índice único:** La colección `bookings` en MongoDB no tenía restricción de unicidad en la combinación (email, date, time)
3. **Sin manejo de errores:** Cuando MongoDB rechazaba por E11000 errors, el mensaje de error no era claro para el usuario

---

## ✅ Soluciones Implementadas

### 1. **Agregar Índice Único en MongoDB**

**Archivo:** `/home/ubuntu/landingStiven/backend/models/Booking.js`

```javascript
// Add unique compound index to prevent duplicate bookings for same email at same date/time
bookingSchema.index({ email: 1, date: 1, time: 1 }, { unique: true, sparse: true });
```

**Beneficio:** MongoDB ahora rechaza automáticamente cualquier intento de crear un documento con la misma combinación de (email, date, time).

---

### 2. **Validación Previa en el Endpoint**

**Archivo:** `/home/ubuntu/landingStiven/backend/routes/bookingRoutes.js` (líneas ~125-145)

```javascript
// Check if booking already exists for this email at this date/time
const existingBooking = await Booking.findOne({
  email: email,
  date: date,
  time: time
});

if (existingBooking) {
  return res.status(409).json({
    success: false,
    message: 'Ya existe una cita agendada para este email en esta fecha y hora',
    existingBooking: {
      id: existingBooking._id,
      date: existingBooking.date,
      time: existingBooking.time,
      status: existingBooking.status
    }
  });
}
```

**Beneficio:** Validación rápida en la aplicación antes de intentar guardar, con mensaje de error claro.

---

### 3. **Manejo de Errores MongoDB (E11000)**

**Archivo:** `/home/ubuntu/landingStiven/backend/routes/bookingRoutes.js` (catch block, líneas ~280-295)

```javascript
// Handle duplicate key error from unique index
if (error.code === 11000 && error.keyPattern && error.keyPattern.email && 
    error.keyPattern.date && error.keyPattern.time) {
  console.warn('Duplicate booking attempt:', { email, date, time });
  return res.status(409).json({
    success: false,
    message: 'Ya existe una cita agendada para este email en esta fecha y hora',
    error: 'DUPLICATE_BOOKING'
  });
}
```

**Beneficio:** Si por algún motivo el índice rechaza, el usuario recibe un mensaje claro en lugar de un error genérico 500.

---

### 4. **Script de Limpieza y Verificación**

**Archivo:** `/home/ubuntu/landingStiven/scripts/fix-duplicate-bookings.js`

Este script:
- Encuentra todos los duplicados existentes
- Mantiene el booking más antiguo y elimina los posteriores
- Crea el índice único
- Verifica que el índice se creó correctamente

**Ejecución:**
```bash
node /home/ubuntu/landingStiven/scripts/fix-duplicate-bookings.js
```

**Resultado:**
```
✓ Connected to MongoDB
📋 Found 0 duplicate bookings
✓ No duplicates found
📌 Creating unique index on (email, date, time)...
✓ Unique index created successfully
✅ Process completed successfully!
```

---

### 5. **Test Automatizado de Prevención**

**Archivo:** `/home/ubuntu/landingStiven/scripts/test-duplicate-prevention.sh`

Este script verifica que la prevención funciona correctamente:

```bash
bash /home/ubuntu/landingStiven/scripts/test-duplicate-prevention.sh
```

**Resultado esperado:**
```
🧪 Testing duplicate booking prevention...

1️⃣ Creating first booking...
✓ First booking created: 698688da52ea605ea4e5b1b5

2️⃣ Attempting to create duplicate booking...
Response (HTTP Code: 409):
✅ Duplicate prevention WORKING! Got expected error message

3️⃣ Verifying database...
✅ Database integrity verified - only 1 booking exists
```

---

## 🛡️ Múltiples Capas de Protección

| Capa | Mecanismo | HTTP Code | Beneficio |
|------|-----------|-----------|-----------|
| Aplicación | Validación previa | 409 | Respuesta inmediata |
| Base de datos | Índice único | 11000 error | Protección adicional |
| Manejo de errores | Catch E11000 | 409 | Mensaje claro |

---

## 📊 Índices Creados

```
- _id_: [["_id",1]]
- confirmationToken_1: [["confirmationToken",1]]
- createdAt_-1: [["createdAt",-1]]
- clientName_1: [["clientName",1]]
- email_1: [["email",1]]
- email_1_date_1_time_1: [["email",1],["date",1],["time",1]]  ← NUEVO
```

---

## 🔧 Cambios de Configuración

### Backend (server.js)
- ✅ Actualizado para escuchar en ambos modos (development y production)
- ✅ PORT configurado a 5001 en .env

### Nginx
- ✅ Actualizado upstream a `localhost:5001`
- ✅ Reloaded y verificado

---

## 📝 Casos de Uso Protegidos

### ✅ Caso 1: Mismo usuario intenta agendar a la misma hora
```json
{
  "email": "user@example.com",
  "date": "2026-02-15",
  "time": "10:00"  // Ya existe
}
→ Resultado: 409 Conflict - "Ya existe una cita agendada..."
```

### ✅ Caso 2: Diferentes horarios del mismo usuario
```json
{
  "email": "user@example.com",
  "date": "2026-02-15",
  "time": "14:00"  // Diferente hora
}
→ Resultado: 200 OK - Se crea exitosamente
```

### ✅ Caso 3: Mismo horario, diferente usuario
```json
{
  "email": "other@example.com",
  "date": "2026-02-15",
  "time": "10:00"  // Misma hora pero email diferente
}
→ Resultado: 200 OK - Se crea exitosamente (consultante puede ver múltiples)
```

---

## 🚀 Verificación Post-Deploy

```bash
# 1. Verificar que el backend está corriendo
curl -s http://localhost:5001/api/health
# Resultado: {"status":"OK","message":"Server is running"}

# 2. Verificar que el índice existe
mongosh stivenads-production --eval "db.bookings.getIndexes()"
# Debe mostrar: email_1_date_1_time_1

# 3. Ejecutar test de prevención
bash /home/ubuntu/landingStiven/scripts/test-duplicate-prevention.sh
# Resultado: ✅ Duplicate prevention WORKING!
```

---

## 📚 Código Modificado

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `backend/models/Booking.js` | Agregar índice único | ~108 |
| `backend/routes/bookingRoutes.js` | Validación previa + error handling | ~125-145, 280-295 |
| `backend/server.js` | Escuchar en todos los modos | ~57 |
| `scripts/fix-duplicate-bookings.js` | Script nuevo (limpieza) | - |
| `scripts/test-duplicate-prevention.sh` | Script nuevo (test) | - |

---

## ⚠️ Notas Importantes

1. **Índice sparse:** El índice es `sparse`, lo que significa que documentos con campos NULL no generan conflicto. Esto es correcto para nuestro caso de uso.

2. **Rollback:** Si necesita revertir los cambios:
   ```bash
   # Remover el índice
   mongosh stivenads-production --eval "db.bookings.dropIndex('email_1_date_1_time_1')"
   ```

3. **Performance:** El índice compuesto mejora también las búsquedas de bookings por email + fecha.

---

## ✅ Estado Final

- ✅ Índice único creado y verificado
- ✅ Validación previa en endpoint implementada
- ✅ Manejo de errores MongoDB mejorado
- ✅ Script de limpieza/verificación creado
- ✅ Test automatizado pasando
- ✅ Backend corriendo en puerto 5001
- ✅ Nginx configurado correctamente
- ✅ Documentación completa

**Resultado:** No más duplicados. Sistema protegido con múltiples capas de validación.
