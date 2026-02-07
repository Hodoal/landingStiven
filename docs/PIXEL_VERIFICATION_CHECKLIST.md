# ✅ Checklist de Verificación - Facebook Pixel

## Pre-requisitos

- [ ] Node.js y npm instalados
- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Navegador Chrome con Facebook Pixel Helper instalado
- [ ] Acceso a Facebook Events Manager

---

## 1️⃣ Verificación Técnica

### Código Base
- [x] Pixel instalado en `frontend/index.html`
- [x] Pixel ID correcto: `2118145782285965`
- [x] Evento PageView automático configurado
- [x] Servicio `facebookPixel.js` creado

### Componentes
- [x] App.jsx - Scroll depth tracking
- [x] Hero.jsx - CTA tracking
- [x] Header.jsx - CTA tracking  
- [x] CTA.jsx - CTA section tracking
- [x] FloatingButton.jsx - Floating CTA tracking
- [x] BookingModal.jsx - Booking flow tracking
- [x] PilotApplicationModal.jsx - Application flow tracking
- [x] ApplicationForm.jsx - Form tracking (ya existía)

---

## 2️⃣ Test en Navegador

### Consola de Desarrollador
- [ ] Abrir DevTools (F12)
- [ ] Buscar: `✅ Facebook Pixel inicializado correctamente`
- [ ] No hay errores de JavaScript
- [ ] `typeof window.fbq` retorna `"function"`

### Facebook Pixel Helper
- [ ] Extensión instalada y activa
- [ ] Icono verde en la barra de herramientas
- [ ] Muestra el Pixel ID: `2118145782285965`
- [ ] Evento PageView detectado al cargar

---

## 3️⃣ Test de Flujos Completos

### Flujo 1: Hero → Aplicación Piloto
1. [ ] Cargar página principal
   - Verificar: `PageView` en Pixel Helper
   
2. [ ] Hacer scroll al 25%, 50%, 75%, 100%
   - Verificar en consola: `📊 Facebook Pixel: Evento personalizado 'ScrollDepth'`
   
3. [ ] Click en CTA del Hero
   - Verificar en consola: `📊 Facebook Pixel: Evento personalizado 'CTAClick'`
   - Data debe incluir: `cta_location: 'hero_section'`
   
4. [ ] Modal de aplicación se abre
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'StartApplication'`
   
5. [ ] Responder preguntas (avanzar al menos 2 preguntas)
   - Verificar: `📊 Facebook Pixel: Evento 'ViewContent'` por cada pregunta
   
6. [ ] Completar con respuestas que califiquen
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'QualifiedLead'`
   
7. [ ] Ingresar datos de contacto
   - Verificar: `📊 Facebook Pixel: Evento 'Lead'`
   
8. [ ] Agendar reunión (seleccionar fecha y hora)
   - Verificar: `📊 Facebook Pixel: Evento 'Schedule'`
   - Verificar: `📊 Facebook Pixel: Evento 'CompleteRegistration'`

### Flujo 2: Header → Booking Directo
1. [ ] Click en botón del Header
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'CTAClick'`
   - Data: `cta_location: 'header'`
   
2. [ ] Modal de Booking se abre
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'StartBooking'`
   
3. [ ] Completar formulario de contacto
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'CompleteBookingForm'`
   
4. [ ] Seleccionar fecha en calendario
   - Verificar: `📊 Facebook Pixel: Evento 'ViewContent'` (Selección de Fecha)
   
5. [ ] Seleccionar hora
   - Verificar: `📊 Facebook Pixel: Evento 'ViewContent'` (Selección de Hora)
   
6. [ ] Confirmar agendamiento
   - Verificar: `📊 Facebook Pixel: Evento 'Schedule'` (ConfirmBooking)
   - Verificar: `📊 Facebook Pixel: Evento 'Lead'`

### Flujo 3: Botón Flotante
1. [ ] Hacer scroll para que aparezca el botón flotante (>500px)
2. [ ] Click en botón flotante
   - Verificar: `📊 Facebook Pixel: Evento personalizado 'CTAClick'`
   - Data: `cta_location: 'floating_button'`
3. [ ] Seguir flujo de aplicación o booking

---

## 4️⃣ Verificación en Facebook

### Events Manager - Test Events
1. [ ] Ir a: https://business.facebook.com/events_manager
2. [ ] Seleccionar Pixel: `2118145782285965`
3. [ ] Click en "Test Events" en el menú lateral
4. [ ] Ingresar tu dirección IP o nombre de navegador
5. [ ] Ejecutar flujos de prueba
6. [ ] Verificar que eventos aparecen en tiempo real

### Events Manager - Overview
1. [ ] Ver sección "Activity"
2. [ ] Verificar eventos de las últimas horas
3. [ ] Revisar que los datos adicionales se están enviando correctamente

### Pixel Health Check
- [ ] Estado del pixel: Verde/Activo
- [ ] Eventos en las últimas 24 horas: > 0
- [ ] Sin errores de implementación
- [ ] Match Quality: Good (si aplica)

---

## 5️⃣ Verificación de Datos

### Eventos Estándar
- [ ] `PageView` - Se registra al cargar página
- [ ] `Lead` - Se registra en formularios completados
- [ ] `Schedule` - Se registra al agendar
- [ ] `CompleteRegistration` - Se registra al completar proceso
- [ ] `ViewContent` - Se registra en vistas de contenido

### Eventos Personalizados
- [ ] `QualifiedLead` - Con valor $50
- [ ] `StartApplication` - Al abrir modal aplicación
- [ ] `StartBooking` - Al abrir modal booking
- [ ] `CompleteBookingForm` - Al completar formulario
- [ ] `ConfirmBooking` - Con valor $100
- [ ] `CTAClick` - Con ubicación del CTA
- [ ] `ScrollDepth` - En 25%, 50%, 75%, 100%

### Metadata Correcta
Verificar que los eventos incluyen:
- [ ] `content_name` apropiado
- [ ] `value` y `currency` cuando aplica
- [ ] Datos contextuales (fecha, hora, tipo de lead, etc.)
- [ ] Sin información sensible (contraseñas, datos financieros)

---

## 6️⃣ Pruebas de Producción

### Pre-despliegue
- [ ] Todas las pruebas de desarrollo pasadas
- [ ] Sin errores en consola
- [ ] Documentación revisada
- [ ] Script de verificación ejecutado exitosamente

### Post-despliegue
- [ ] Verificar pixel en producción
- [ ] Probar al menos un flujo completo en producción
- [ ] Verificar eventos en Events Manager desde producción
- [ ] Configurar alertas en Facebook para errores de pixel

---

## 7️⃣ Optimización de Campañas

### Configuración Inicial
- [ ] Crear audiencia personalizada: Visitantes con 75%+ scroll
- [ ] Crear audiencia: Iniciaron aplicación pero no completaron
- [ ] Crear audiencia: Leads calificados
- [ ] Configurar conversión personalizada: QualifiedLead
- [ ] Configurar valor de conversión para Schedule ($100)

### Campaigns Setup
- [ ] Objetivo: Conversiones
- [ ] Pixel: 2118145782285965
- [ ] Evento de optimización: Lead o Schedule
- [ ] Tracking de conversiones activo
- [ ] Ventana de atribución configurada

---

## 📊 Métricas a Monitorear

### Diarias
- [ ] Total de PageViews
- [ ] Eventos Lead generados
- [ ] Eventos Schedule (conversiones)
- [ ] Tasa de conversión PageView → Lead
- [ ] Costo por Lead

### Semanales
- [ ] Leads calificados vs totales
- [ ] Tasa de calificación
- [ ] Engagement (scroll depth promedio)
- [ ] CTAs más efectivos
- [ ] Flujo con mejor conversión

---

## 🐛 Troubleshooting

Si algo no funciona:

- [ ] Verificar que no hay bloqueadores de anuncios activos
- [ ] Limpiar caché del navegador
- [ ] Verificar que el pixel ID es correcto
- [ ] Revisar errores en consola de JavaScript
- [ ] Verificar que `window.fbq` existe
- [ ] Reinstalar Facebook Pixel Helper
- [ ] Probar en modo incógnito
- [ ] Probar en otro navegador

---

## ✅ Firma de Aprobación

**Fecha de verificación:** _______________

**Verificado por:** _______________

**Todos los checks pasados:** [ ] Sí [ ] No

**Observaciones:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Estado Final:** 
- [ ] ✅ Aprobado para producción
- [ ] ⚠️  Necesita ajustes
- [ ] ❌ Requiere revisión completa

---

## 📚 Referencias Rápidas

- **Documentación completa:** `docs/FACEBOOK_PIXEL_INTEGRATION.md`
- **Resumen ejecutivo:** `docs/FACEBOOK_PIXEL_SUMMARY.md`
- **Script de verificación:** `./scripts/verify-facebook-pixel.sh`
- **Test en navegador:** `scripts/test-pixel-in-browser.js`
- **Events Manager:** https://business.facebook.com/events_manager
- **Pixel Helper:** https://chrome.google.com/webstore/detail/facebook-pixel-helper/
- **Docs oficiales:** https://developers.facebook.com/docs/facebook-pixel
