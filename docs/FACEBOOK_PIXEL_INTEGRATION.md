# Integración Completa de Facebook Pixel (Meta Pixel)

## 📊 Información General

**Pixel ID:** `2118145782285965`

Esta aplicación tiene una integración completa del Facebook Pixel para rastrear todas las interacciones importantes de los usuarios y optimizar las campañas publicitarias.

## 🎯 Eventos Rastreados

### Eventos Estándar de Facebook

1. **PageView** - Automático al cargar la página
   - Se activa automáticamente desde el código base en `index.html`

2. **Lead** - Cuando se genera un lead
   - Formulario de contacto completado
   - Aplicación piloto enviada
   - Agendamiento confirmado

3. **Schedule** - Cuando se agenda una cita
   - Confirmación de agendamiento (BookingModal)
   - Confirmación de reunión piloto (PilotApplicationModal)

4. **CompleteRegistration** - Cuando se completa el proceso
   - Reunión confirmada y programada exitosamente

5. **ViewContent** - Visualización de contenido importante
   - Progreso a través del formulario
   - Selección de fecha/hora
   - Vistas de secciones importantes

### Eventos Personalizados (Custom Events)

1. **QualifiedLead** - Lead que cumple criterios de calificación
   - Valor: $50 USD
   - Datos: tipo de lead, consultas mensuales, presupuesto

2. **StartApplication** - Inicio de aplicación piloto
   - Se activa al abrir el modal de aplicación

3. **StartBooking** - Inicio de proceso de agendamiento
   - Se activa al abrir el modal de booking

4. **CompleteBookingForm** - Formulario de booking completado
   - Datos del usuario ingresados

5. **ConfirmBooking** - Confirmación de agendamiento
   - Fecha, hora y datos del cliente

6. **CTAClick** - Clics en llamados a la acción
   - Ubicación del CTA (hero, header, floating button, etc.)
   - Texto del CTA

7. **ScrollDepth** - Profundidad de scroll
   - Seguimiento en 25%, 50%, 75%, 100%

8. **WhatsAppClick** - Clic en botón de WhatsApp
   - (Preparado para futuras implementaciones)

## 📁 Estructura de Archivos

### Archivos Modificados/Creados:

```
frontend/
├── index.html                                   # Meta Pixel base code
├── src/
│   ├── App.jsx                                 # Scroll depth tracking
│   ├── services/
│   │   └── facebookPixel.js                   # Servicio principal de tracking
│   └── components/
│       ├── ApplicationForm.jsx                # Tracking de formulario (ya existía)
│       ├── PilotApplicationModal.jsx          # Tracking de aplicación piloto
│       ├── BookingModal.jsx                   # Tracking de agendamiento
│       ├── Hero.jsx                           # Tracking de CTA principal
│       ├── Header.jsx                         # Tracking de CTA en header
│       ├── CTA.jsx                            # Tracking de CTA section
│       └── FloatingButton.jsx                 # Tracking de botón flotante
```

## 🔧 Uso del Servicio

### Importar y Usar en Componentes

```javascript
import { useFacebookPixel } from '../services/facebookPixel'

function MyComponent() {
  const { events: fbEvents } = useFacebookPixel()
  
  const handleAction = () => {
    // Rastrear evento
    fbEvents.LEAD_GENERATED({
      lead_type: 'contact_form',
      value: 50,
      currency: 'USD'
    })
    
    // Tu lógica aquí...
  }
  
  return <button onClick={handleAction}>Enviar</button>
}
```

### Eventos Disponibles

```javascript
// Eventos estándar
fbEvents.LEAD_GENERATED(data)           // Lead generado
fbEvents.SCHEDULE_APPOINTMENT(data)     // Cita agendada
fbEvents.COMPLETE_APPOINTMENT(data)     // Proceso completado
fbEvents.VIEW_CONTENT(contentName, data) // Contenido visto

// Eventos personalizados
fbEvents.QUALIFIED_LEAD(data)           // Lead calificado
fbEvents.START_APPLICATION(data)        // Inicio de aplicación
fbEvents.START_BOOKING(data)            // Inicio de agendamiento
fbEvents.COMPLETE_BOOKING_FORM(data)    // Formulario completado
fbEvents.CONFIRM_BOOKING(data)          // Agendamiento confirmado
fbEvents.CTA_CLICK(location, data)      // Clic en CTA
fbEvents.SCROLL_DEPTH(depth, data)      // Profundidad de scroll
fbEvents.WHATSAPP_CLICK(data)           // Clic en WhatsApp
```

## 📈 Eventos por Componente

### App.jsx
- ✅ Scroll depth (25%, 50%, 75%, 100%)

### Hero.jsx
- ✅ CTA Click (hero_section)

### Header.jsx
- ✅ CTA Click (header)

### CTA.jsx
- ✅ CTA Click (main_cta_section)

### FloatingButton.jsx
- ✅ CTA Click (floating_button)

### BookingModal.jsx
- ✅ Start Booking (al abrir)
- ✅ Complete Booking Form (formulario completado)
- ✅ View Content (selección de fecha)
- ✅ View Content (selección de hora)
- ✅ Confirm Booking (confirmación final)
- ✅ Lead Generated (conversión exitosa)

### PilotApplicationModal.jsx
- ✅ Start Application (al abrir)
- ✅ View Content (progreso por preguntas)
- ✅ Qualified Lead (lead califica)
- ✅ View Content (lead descalificado)
- ✅ Lead Generated (formulario inicial enviado)
- ✅ Schedule Appointment (reunión agendada)
- ✅ Complete Appointment (proceso completo)

### ApplicationForm.jsx
- ✅ View Content (progreso del formulario)
- ✅ View Content (lead descalificado)
- ✅ Lead Generated (lead generado)
- ✅ Qualified Lead (lead calificado)
- ✅ Schedule Appointment (cita agendada)

## 🚀 Testing y Verificación

### 1. Verificar en la Consola del Navegador

Todos los eventos logean información en la consola:
```
📊 Facebook Pixel: Evento 'Lead' enviado {data}
📊 Facebook Pixel: Evento personalizado 'QualifiedLead' enviado {data}
```

### 2. Facebook Pixel Helper (Extensión Chrome)

1. Instala la extensión "Facebook Pixel Helper"
2. Navega por el sitio
3. La extensión mostrará todos los eventos capturados en tiempo real

### 3. Events Manager de Facebook

1. Ve a [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Selecciona tu Pixel ID: `2118145782285965`
3. Ve a "Test Events" para ver eventos en tiempo real
4. Revisa el historial de eventos en las últimas 48 horas

### 4. Prueba Manual - Flujo Completo

#### Flujo 1: Aplicación Piloto
1. Abrir página → `PageView` + `ScrollDepth`
2. Click en CTA Hero → `CTAClick (hero_section)`
3. Abrir modal → `StartApplication`
4. Responder preguntas → `ViewContent (Pregunta X)`
5. Calificar → `QualifiedLead`
6. Completar datos → `Lead Generated`
7. Agendar reunión → `Schedule Appointment` + `Complete Appointment`

#### Flujo 2: Agendamiento Directo
1. Click en botón flotante → `CTAClick (floating_button)`
2. Abrir booking modal → `StartBooking`
3. Completar formulario → `CompleteBookingForm`
4. Seleccionar fecha → `ViewContent (Selección de Fecha)`
5. Seleccionar hora → `ViewContent (Selección de Hora)`
6. Confirmar → `ConfirmBooking` + `Lead Generated`

## 🎯 Optimización de Campañas

### Eventos Clave para Optimización

1. **Lead** - Usa este evento como objetivo principal de conversión
2. **Schedule** - Evento de alto valor, más cercano a venta
3. **QualifiedLead** - Filtra por calidad de leads

### Audiencias Personalizadas

Puedes crear audiencias basadas en:
- Personas que completaron 50%+ de scroll
- Personas que iniciaron pero no completaron aplicación
- Personas que agendaron reunión
- Leads calificados vs descalificados

### Conversiones Personalizadas

En Facebook Ads Manager, configura:
1. Lead como conversión principal
2. Schedule como micro-conversión
3. QualifiedLead para optimizar por calidad

## 🔒 Consideraciones de Privacidad

- ✅ El pixel respeta las preferencias de cookies
- ✅ Información sensible no se envía (solo nombres de eventos y metadata)
- ✅ Compatible con GDPR/CCPA mediante CookiesBanner

## 🐛 Troubleshooting

### El pixel no se carga
- Verifica que `window.fbq` existe en la consola
- Revisa que no haya bloqueadores de anuncios activos
- Confirma el ID del pixel: `2118145782285965`

### Eventos no se registran
- Abre la consola y busca mensajes de `📊 Facebook Pixel`
- Verifica que no hay errores de JavaScript
- Usa Facebook Pixel Helper para diagnosticar

### Eventos duplicados
- Asegúrate de que el código del pixel solo está en `index.html`
- Verifica que no hay múltiples llamadas al mismo evento

## 📞 Soporte

Para soporte o preguntas sobre la integración:
- Revisar documentación: [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- Events Manager: [Facebook Events Manager](https://business.facebook.com/events_manager)
- Pixel Helper: [Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0  
**Pixel ID:** 2118145782285965
