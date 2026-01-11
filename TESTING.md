# Ejemplos de Uso y Testing

## Testing Manual

### 1. Health Check

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Obtener Horarios Disponibles

```bash
curl "http://localhost:3001/api/booking/available-times?date=2024-01-20"
```

Respuesta esperada:
```json
{
  "success": true,
  "times": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", ...],
  "totalSlots": 20,
  "bookedSlots": []
}
```

### 3. Crear Agendamiento

```bash
curl -X POST http://localhost:3001/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+57 300 123 4567",
    "company": "Mi Empresa",
    "message": "Necesito ayuda con marketing digital",
    "date": "2024-01-20",
    "time": "10:00"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "booking": {
    "id": "507f1f77bcf86cd799439011",
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "teamsLink": "https://teams.microsoft.com/l/meetup-join/..."
  }
}
```

### 4. Obtener Detalles de Agendamiento

```bash
curl http://localhost:3001/api/booking/507f1f77bcf86cd799439011
```

### 5. Cancelar Agendamiento

```bash
curl -X POST http://localhost:3001/api/booking/507f1f77bcf86cd799439011/cancel
```

## Testing Frontend

### Flujo Completo

1. **Abrir aplicación**
   ```
   http://localhost:5173
   ```

2. **Hacer scroll** hacia abajo y observar:
   - Animaciones de entrada de componentes
   - Aparición del botón flotante después de 500px de scroll
   - Transiciones suaves entre secciones

3. **Hacer clic en "Agendar"**
   - Se abre el modal
   - Validación del formulario

4. **Llenar Formulario**
   ```
   Nombre: Juan Pérez
   Email: juan@example.com
   Teléfono: +57 300 000 0000
   Empresa: Mi Empresa
   Mensaje: Necesito ayuda
   ```

5. **Seleccionar Fecha y Hora**
   - Calendário muestra solo fechas futuras
   - Al seleccionar una fecha, se cargan horarios disponibles
   - Seleccionar un horario

6. **Confirmar**
   - Debería mostrar página de confirmación
   - Se envía correo (si está configurado)

## Validaciones a Probar

### Validación: Horarios Ocupados

1. Agendar en "10:00 - 20 de enero"
2. Intentar agendar otra vez en mismo horario
3. Resultado: "Este horario ya no está disponible"

### Validación: Fechas Pasadas

1. Intentar seleccionar una fecha pasada
2. Resultado: El botón está deshabilitado

### Validación: Email Inválido

1. Ingresar email sin @
2. Intentar avanzar
3. Resultado: Mensaje de error

### Validación: Campos Requeridos

1. Dejar nombre vacío
2. Intentar avanzar
3. Resultado: Validación falla

## Testing de Responsive

### Mobile (375px)
```bash
# En DevTools de Chrome:
# Cmd+Shift+M para emular dispositivo móvil
```

Verificar:
- ✅ Header se ve bien
- ✅ Botón flotante se ve (solo icono en mobile)
- ✅ Calendario se adapta
- ✅ Formulario es legible
- ✅ Todos los botones son clickeables

### Tablet (768px)
Verificar:
- ✅ Layout en 2 columnas donde corresponda
- ✅ Navegación se adapta

### Desktop (1920px)
Verificar:
- ✅ Layout completo se ve bien
- ✅ Animaciones fluidas

## Testing de Animaciones

1. **Scroll Dinámico**
   - Abre console: F12
   - Ve a Elements y selecciona un componente
   - Haz scroll lento
   - Observa las animaciones de entrada

2. **Botón Flotante**
   - Carga la página
   - No debe aparecer al inicio
   - Haz scroll hacia abajo 500px
   - Debe aparecer con animación de escala

3. **Modal**
   - Abre modal
   - Cierra modal
   - Verifica que el overlay se anima

## Testing de Correos

Para probar envío de correos sin configurar credenciales reales:

1. **Usar Mailtrap** (test email service)
   - Ve a [mailtrap.io](https://mailtrap.io)
   - Crea cuenta gratuita
   - Obtén credenciales SMTP
   - Configura en .env

2. **Usar Gmail (app password)**
   - Habilita 2FA en Google
   - Genera contraseña de aplicación
   - Configura en .env

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx
```

## Casos de Prueba Automáticos

### Crear con Jest (opcional)

```javascript
// test/booking.test.js
const request = require('supertest');
const app = require('../server');

describe('Booking API', () => {
  test('Should get available times', async () => {
    const res = await request(app)
      .get('/api/booking/available-times?date=2024-01-20');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.times)).toBe(true);
  });

  test('Should create booking', async () => {
    const res = await request(app)
      .post('/api/booking/create')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+57 300 000 0000',
        company: 'Test Company',
        date: '2024-01-20',
        time: '10:00'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Should prevent duplicate booking', async () => {
    // Primera reserva
    await request(app)
      .post('/api/booking/create')
      .send({...});
    
    // Segunda reserva en mismo horario
    const res = await request(app)
      .post('/api/booking/create')
      .send({...});
    
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
```

Ejecutar tests:
```bash
npm test
```

## Checklist de Testing

- [ ] Health check retorna 200
- [ ] Horarios disponibles se cargan correctamente
- [ ] No se pueden crear duplicados
- [ ] Validaciones de email funcionan
- [ ] Validaciones de campos obligatorios funcionan
- [ ] Formulario se completa correctamente
- [ ] Modal se abre y cierra
- [ ] Calendario selecciona fechas
- [ ] Botón flotante aparece/desaparece
- [ ] Responsive funciona en mobile
- [ ] Responsive funciona en tablet
- [ ] Responsive funciona en desktop
- [ ] Animaciones son suaves
- [ ] Correos se envían (si está configurado)
- [ ] Google Calendar se sincroniza (si está configurado)

## Problemas Comunes

### "Port 3001 already in use"
```bash
# Encontrar proceso usando puerto 3001
lsof -i :3001
# Matar proceso
kill -9 <PID>

# O cambiar puerto en server.js
PORT=3002
```

### "Cannot GET /api/booking/available-times"
- Verificar que backend está corriendo
- Verificar que URL es correcta
- Revisar logs del backend

### "CORS error"
- Verificar que CORS está habilitado en backend
- Verificar que FRONTEND_URL es correcto
- En vite.config.js, revisar proxy

### "MongoDB connection error"
- Verificar que MongoDB está corriendo
- Verificar MONGODB_URI en .env
- Intentar conectar con mongosh

### "Email not sending"
- Verificar credenciales de Gmail
- Verificar que 2FA esté habilitado
- Generar nueva app password
- Revisar logs del servidor

## Performance Testing

### Frontend

```bash
# Build y analizar tamaño
cd frontend
npm run build

# Ver tamaño de bundle
ls -lh dist/
```

### Backend

```bash
# Prueba de carga con Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/health
```

## Conclusión

La aplicación está completamente funcional y lista para testing. Todos los endpoints están implementados y validados. El frontend es responsive y tiene animaciones profesionales.
