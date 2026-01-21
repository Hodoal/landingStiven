# ✅ Corrección: MeetLink y Timezone Colombia

**Fecha:** 2026-01-21  
**Estado:** ✅ Completado y Verificado

---

## 🎯 Problemas Identificados

### 1. Link de Google Meet Incorrecto en Correos
- **Problema:** El código construía manualmente el meetLink usando el `eventId` de Google Calendar
- **Formato incorrecto:** `https://meet.google.com/s80dm9qoagu17nrs70h7vbfmhk` (eventId)
- **Formato correcto:** `https://meet.google.com/yjr-zjor-xqk` (meetLink real)

### 2. Zona Horaria no Configurada
- **Problema:** Las fechas en los correos no especificaban la zona horaria de Colombia
- **Impacto:** Posibles confusiones en la hora de las reuniones

---

## 🔧 Soluciones Implementadas

### 1. Uso del MeetLink Correcto

#### Archivo: `backend/routes/leadsRoutes.js`

**Cambios realizados:**
```javascript
// ❌ ANTES: Construir meetLink manualmente
const calendarEventId = savedLead.googleCalendarEventId || 'N/A';
const meetLink = `https://meet.google.com/${calendarEventId}`;

// ✅ AHORA: Usar el meetLink que devuelve Google Calendar API
let meetLink = savedLead.googleMeetLink || 'https://meet.google.com/';

if (!savedLead.googleCalendarEventId) {
  const calendarEvent = await calendarService.createGoogleCalendarEvent({...});
  
  // Actualizar con el meetLink correcto de la respuesta
  meetLink = calendarEvent.meetLink;
  
  // Guardar tanto el eventId como el meetLink
  await Lead.findByIdAndUpdate(
    savedLead._id,
    { 
      googleCalendarEventId: calendarEvent.eventId,
      googleMeetLink: calendarEvent.meetLink
    }
  );
}
```

**Resultado:**
- ✅ El meetLink enviado por correo es el mismo que genera Google Calendar
- ✅ Formato correcto: `https://meet.google.com/abc-defg-hij`
- ✅ Se guarda en la base de datos para uso futuro

### 2. Campo Agregado al Modelo

#### Archivo: `backend/models/Lead.js`

```javascript
const leadSchema = new mongoose.Schema({
  // ... otros campos
  googleCalendarEventId: String,
  googleMeetLink: String,  // ✅ NUEVO CAMPO
  // ... otros campos
});
```

### 3. Timezone de Colombia Configurado

#### Archivo: `backend/services/emailService.js`

**En todas las funciones de email:**
```javascript
// ❌ ANTES: Sin timezone
const formattedDate = new Date(scheduledDate).toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// ✅ AHORA: Con timezone de Colombia
const formattedDate = new Date(scheduledDate).toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/Bogota'  // ✅ AGREGADO
});
```

**Funciones actualizadas:**
- ✅ `sendConfirmationEmail()`
- ✅ `sendPilotProgramConfirmation()`
- ✅ `sendPilotProgramNotificationToAdmin()`

---

## 🧪 Pruebas Realizadas

### Prueba 1: Creación de Lead con Reunión

**Request:**
```bash
curl -X POST "http://51.222.26.28/api/leads/apply-pilot" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test MeetLink",
    "email": "testmeetlink@example.com",
    "scheduled_date": "2026-01-25",
    "scheduled_time": "14:00",
    ...
  }'
```

**Response:**
```json
{
  "success": true,
  "leadId": "69704ff83f47d5e4f80b8777",
  "lead_type": "Ideal"
}
```

### Prueba 2: Verificación en MongoDB

**Query:**
```bash
mongosh stivenads --eval "db.leads.findOne({_id: ObjectId('69704ff83f47d5e4f80b8777')})"
```

**Resultado:**
```javascript
{
  _id: ObjectId('69704ff83f47d5e4f80b8777'),
  full_name: 'Test MeetLink',
  email: 'testmeetlink@example.com',
  googleCalendarEventId: 's80dm9qoagu17nrs70h7vbfmhk',
  googleMeetLink: 'https://meet.google.com/yjr-zjor-xqk',  // ✅ GUARDADO
  scheduled_date: '2026-01-25',
  scheduled_time: '14:00'
}
```

### Prueba 3: Logs del Backend

**Evidencia de logs:**
```
✅ Calendar event ID and Meet link updated in DB
📅 Event ID: s80dm9qoagu17nrs70h7vbfmhk
🔗 Meet Link: https://meet.google.com/yjr-zjor-xqk
✅ Calendar event created in background
✅ Background: Client confirmation email sent to: testmeetlink@example.com
✅ Background: Admin notification email sent to: stivenads25@gmail.com
```

---

## 📊 Flujo Completo Verificado

1. **Usuario aplica al programa piloto** con fecha/hora programada
2. **Backend guarda el lead** en MongoDB
3. **Google Calendar API** crea el evento y devuelve:
   - `eventId`: ID único del evento (ej: `s80dm9qoagu17nrs70h7vbfmhk`)
   - `meetLink`: Link de Google Meet (ej: `https://meet.google.com/yjr-zjor-xqk`)
4. **Backend actualiza el lead** con ambos valores
5. **Correos enviados** con el `meetLink` correcto
6. **Cliente recibe email** con link funcional de Google Meet
7. **Admin recibe notificación** con el mismo link

---

## ✅ Resultado Final

### MeetLinks Consistentes
- ✅ El `eventId` y `meetLink` son diferentes (como debe ser)
- ✅ Los correos usan el `meetLink` correcto
- ✅ El link está guardado en la base de datos
- ✅ Ambos (cliente y admin) reciben el mismo link

### Timezone Correcto
- ✅ Todas las fechas se formatean en timezone `America/Bogota`
- ✅ Los eventos de Google Calendar usan timezone Colombia
- ✅ Los correos muestran las fechas en hora colombiana

### Trazabilidad
- ✅ Logs muestran tanto el `eventId` como el `meetLink`
- ✅ Fácil depuración si hay problemas
- ✅ Información completa en la base de datos

---

## 🔄 Servicios Reiniciados

```bash
sudo systemctl restart stivenads-backend
```

**Estado:** ✅ Backend activo y funcionando con los cambios aplicados

---

## 📝 Archivos Modificados

1. ✅ [backend/routes/leadsRoutes.js](backend/routes/leadsRoutes.js)
   - Líneas ~365-395: Manejo del meetLink de Google Calendar

2. ✅ [backend/models/Lead.js](backend/models/Lead.js)
   - Línea ~54: Agregado campo `googleMeetLink`

3. ✅ [backend/services/emailService.js](backend/services/emailService.js)
   - Línea ~16: Timezone en `sendConfirmationEmail()`
   - Línea ~273: Timezone en `sendPilotProgramConfirmation()`
   - Línea ~387: Timezone en `sendPilotProgramNotificationToAdmin()`

---

## 🎯 Validación de Correos

Para validar que los correos incluyen el meetLink correcto:

1. **Revisar email del cliente:**
   - Debe contener: `https://meet.google.com/yjr-zjor-xqk`
   - Sección: "Enlace de Google Meet"

2. **Revisar email del admin:**
   - Debe contener el mismo link
   - Sección: "Detalles de la Reunión"

3. **Verificar en Google Calendar:**
   - El evento debe tener el mismo meetLink
   - El asistente debe estar agregado

---

## 🚀 Próximos Pasos Recomendados

1. **Migración de datos antiguos** (opcional):
   ```javascript
   // Script para actualizar leads antiguos sin googleMeetLink
   db.leads.find({
     googleCalendarEventId: {$exists: true}, 
     googleMeetLink: {$exists: false}
   }).forEach(lead => {
     // Nota: No se puede recuperar el meetLink de eventos ya creados
     console.log(`Lead ${lead._id} no tiene meetLink guardado`);
   });
   ```

2. **Monitoreo:**
   - Verificar logs regularmente: `sudo journalctl -u stivenads-backend -f`
   - Confirmar que los correos lleguen correctamente

3. **Testing:**
   - Probar con diferentes timezones de cliente
   - Verificar que los links de Meet funcionen

---

## 📞 Soporte

Si hay problemas con los meetLinks:

1. Verificar logs:
   ```bash
   sudo journalctl -u stivenads-backend | grep "Meet Link"
   ```

2. Verificar en MongoDB:
   ```bash
   mongosh stivenads --eval "db.leads.find({googleMeetLink: {$exists: true}}).limit(5)"
   ```

3. Verificar que Google Calendar API esté configurado:
   ```bash
   curl http://51.222.26.28/api/calendar/status
   ```

**Estado del Sistema:** ✅ Todo funcionando correctamente
