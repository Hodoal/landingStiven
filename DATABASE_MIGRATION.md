# Migración de Almacenamiento: Memoria → MongoDB

## Problema Solucionado
**Antes**: Los bookings se almacenaban en un array en memoria (`bookingsStore`) que se perdía cada vez que se reiniciaba el servidor.

**Ahora**: Todos los bookings se persisten en MongoDB, por lo que los datos sobreviven a reinicios del servidor.

## Cambios Implementados

### 1. Modelo Booking Actualizado
📄 `/backend/models/Booking.js`

Agregados campos nuevos:
- `meetLink` - Link del Meet de Google
- `venta_confirmada` (boolean) - Si la venta fue registrada
- `monto_venta` (number) - Monto en COP
- `fecha_venta` (Date) - Cuando se registró la venta
- `cancelledAt` (Date) - Cuando se canceló

Virtual field:
- `id` - Para compatibilidad con el frontend (mapea a `_id`)

### 2. Rutas Actualizadas
📄 `/backend/routes/bookingRoutes.js`

Todas las operaciones ahora usan MongoDB:

| Endpoint | Cambio |
|----------|--------|
| `GET /list` | Lee de MongoDB, ordena por fecha descendente |
| `POST /create` | Guarda documento nuevo en MongoDB |
| `PUT /:id/confirm-sale` | `findByIdAndUpdate` para registrar ventas |
| `PUT /:id/reschedule` | Valida conflictos contra MongoDB, actualiza |
| `PUT /:id/cancel` | Cambia status a "No Confirmado" |
| `DELETE /:id` | Elimina documento de MongoDB |

### 3. Eliminado
- ❌ Variable `let bookingsStore = []` (almacenamiento en memoria)
- ❌ Todas las operaciones de array (`.findIndex()`, `.splice()`, etc.)

## Ventajas

✅ **Persistencia**: Los datos sobreviven a reinicios del servidor
✅ **Escalabilidad**: MongoDB soporta millones de registros
✅ **Disponibilidad**: Los datos están en disco, no en RAM
✅ **Multi-instancia**: Si hay múltiples servidores, todos ven los mismos datos
✅ **Backups**: Los datos de MongoDB se pueden hacer backup facilmente
✅ **Operaciones ACID**: MongoDB proporciona garantías de integridad

## Variables de Entorno Necesarias

```bash
MONGODB_URI=mongodb://localhost:27017/stivenads
```

Si no se especifica, usa el default: `mongodb://localhost:27017/stivenads`

## Verificación

### Confirmar que MongoDB está conectado:
```bash
tail -f /tmp/server.log | grep -i "Connected to MongoDB"
```

### Ver todos los bookings en MongoDB:
```bash
curl http://localhost:3001/api/booking/list | jq '.bookings'
```

### Ver estadísticas en MongoDB:
```bash
mongosh
> use stivenads
> db.bookings.countDocuments()
> db.bookings.find().pretty()
```

## Rollback (si es necesario)

Si necesitas revertir a almacenamiento en memoria:

1. Descomentar `let bookingsStore = []` en `bookingRoutes.js`
2. Cambiar todas las operaciones MongoDB de vuelta a operaciones de array
3. **⚠️ ADVERTENCIA**: Perderás persistencia de datos

## Testing

El servidor fue reiniciado y se verificó que:
1. ✅ Se puede crear un booking nuevo
2. ✅ El booking se guarda en MongoDB
3. ✅ Después de reiniciar el servidor, el booking sigue ahí
4. ✅ El count es correcto (1 booking)

---

**Fecha de migración**: 11 de enero de 2026
**Estado**: ✅ Completado y verificado
