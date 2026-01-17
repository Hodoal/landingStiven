# 🧪 Testing del Sistema de Prueba Piloto

## ⚙️ Setup Inicial

### 1. Instalar dependencias (si no lo has hecho)

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

---

## 🚀 Ejecutar en Desarrollo

### Terminal 1 - Backend
```bash
cd backend
node server.js
```

**Esperado:**
```
Connected to MongoDB
Server running on port 3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Esperado:**
```
Local:   http://localhost:5173
```

### 3. Abre en navegador
```
http://localhost:5173
```

---

## 🧫 Test Cases

### ✅ Test 1: Lead Calificado - IDEAL

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **Sí** ✅
2. ¿Modelo de cuota de litis? → **Sí** (o cualquiera)
3. ¿Consultas mensuales? → **10–30** ✅
4. ¿Invertir en publicidad? → **Sí** ✅
5. ¿Presupuesto ADS? → **$1.000.000 – $2.000.000** ✅
6. ¿Mayor problema? → Selecciona 1+ opciones ✅

**Resultado esperado:**
- ✅ Modal se cierra
- ✅ Alert: "¡Gracias por aplicar! Pronto nos pondremos en contacto contigo."
- 📊 En BD: `status = "applied"`, `lead_type = "Ideal"`
- 📊 Meta Pixel: Event `form_submitted`

---

### ✅ Test 2: Lead Calificado - SCALE

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **Sí** ✅
2. ¿Modelo de cuota de litis? → **Parcialmente** (o cualquiera)
3. ¿Consultas mensuales? → **60+** ✅
4. ¿Invertir en publicidad? → **Sí** ✅
5. ¿Presupuesto ADS? → **Más de $4.000.000** ✅
6. ¿Mayor problema? → Selecciona 1+ opciones ✅

**Resultado esperado:**
- ✅ Modal se cierra
- ✅ Alert: "¡Gracias por aplicar! Pronto nos pondremos en contacto contigo."
- 📊 En BD: `status = "applied"`, `lead_type = "Scale"`
- 📊 Meta Pixel: Event `form_submitted`

---

### ❌ Test 3: Descarte - No es abogado laboral

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **No** ❌

**Resultado esperado:**
- ⚠️ Se muestra mensaje: "No calificas para esta fase"
- ❌ No puede continuar
- 📊 En BD: `status = "disqualified"`, `lead_type = null`
- 📊 Meta Pixel: Event `form_disqualified`

---

### ❌ Test 4: Descarte - Pocas consultas

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **Sí** ✅
2. ¿Modelo de cuota de litis? → **Sí** (o cualquiera)
3. ¿Consultas mensuales? → **0–10** ❌

**Resultado esperado:**
- ⚠️ Se muestra mensaje: "No calificas para esta fase"
- ❌ No puede continuar
- 📊 En BD: `status = "disqualified"`, `lead_type = null`

---

### ❌ Test 5: Descarte - No está dispuesto a invertir

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **Sí** ✅
2. ¿Modelo de cuota de litis? → **Sí**
3. ¿Consultas mensuales? → **30–60** ✅
4. ¿Invertir en publicidad? → **No** ❌

**Resultado esperado:**
- ⚠️ Se muestra mensaje: "No calificas para esta fase"
- ❌ No puede continuar

---

### ❌ Test 6: Descarte - Presupuesto muy bajo

**Respuestas:**
1. ¿Ejerce como abogado laboral? → **Sí** ✅
2. ¿Modelo de cuota de litis? → **Sí**
3. ¿Consultas mensuales? → **30–60** ✅
4. ¿Invertir en publicidad? → **Sí** ✅
5. ¿Presupuesto ADS? → **Menos de $1.000.000** ❌

**Resultado esperado:**
- ⚠️ Se muestra mensaje: "No calificas para esta fase"
- ❌ No puede continuar
- 📊 Meta Pixel: Event `form_disqualified`

---

## 🔍 Verificaciones Técnicas

### DevTools - Console (F12)

**Verificar que no hay errores:**
```javascript
// Debe estar vacío o solo warnings
console.log() // No debe haber errores rojos
```

**Verificar que el modal se monta:**
```javascript
document.querySelector('.pilot-modal-overlay') !== null
```

**Verificar que las opciones se seleccionan:**
```javascript
// Hacer clic en una opción
document.querySelector('.option-button').classList.contains('selected')
// Debe retornar true
```

---

### DevTools - Network (F12 → Network tab)

**Verificar POST a backend:**
1. Abre DevTools
2. Ve a pestaña "Network"
3. Filtra por "apply-pilot"
4. Llena el formulario y envía
5. Debe aparecer una solicitud POST con:
   - Status: **200** ✅
   - Response: `{"success": true, ...}`

---

### DevTools - Storage (F12 → Storage)

**Verificar que se guardan datos:**
1. Abre DevTools
2. Ve a "Storage" → "Cookies"
3. Busca cookies relacionadas (si las hay)
4. O verifica en **Application** → **Local Storage**

---

## 🗄️ Verificar MongoDB

### Opción 1: MongoDB Compass
```
1. Abre MongoDB Compass
2. Conecta a: mongodb://localhost:27017
3. Ve a base de datos: stivenads
4. Ve a colección: leads
5. Filtra por: status = "applied"
6. Debe aparecer tu lead con los datos enviados
```

### Opción 2: Terminal (si tienes mongosh)
```bash
mongosh

use stivenads

db.leads.find({ status: "applied" }).pretty()

db.leads.find({ lead_type: "Ideal" }).pretty()

db.leads.find({ status: "disqualified" }).pretty()
```

---

## 📱 Test Responsive

### Mobile (iPhone 12)
```bash
DevTools → F12
Ctrl+Shift+M (o Cmd+Shift+M en Mac)
```

**Esperado:**
- Modal se ajusta al ancho de la pantalla
- Texto es legible
- Botones son clickeables (48px mínimo)
- Scroll funciona dentro del modal

### Tablet (iPad)
```bash
DevTools → Device Emulation
Selecciona: iPad
```

**Esperado:**
- Modal toma 90% del ancho
- Grid responsivo funciona

---

## 🚨 Troubleshooting

### Error: "Cannot POST /api/leads/apply-pilot"
**Solución:**
- Verifica que el backend está corriendo en puerto 3001
- Verifica que has hecho `git add` y no hay archivos sin commitear
- Reinicia el backend: `node server.js`

### Error: "CORS error"
**Solución:**
- Backend tiene `cors()` en `server.js`
- Si aún falla, verifica que frontend hace request a `http://localhost:3001`

### Error: "lead_type is undefined"
**Solución:**
- Verifica que los datos se envían correctamente
- Revisa la consola del backend para logs

### Modal no se abre
**Solución:**
- Verifica que hay un `<button onClick={() => setShowPilotModal(true)}>`
- Verifica que `App.jsx` tiene `<PilotApplicationModal isOpen={showPilotModal} />`

---

## ✅ Checklist Final

- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Modal se abre al hacer clic en CTA
- [ ] Las 6 preguntas aparecen secuencialmente
- [ ] Barra de progreso funciona (1/6, 2/6, etc.)
- [ ] Botón "Anterior" funciona
- [ ] Botón "Siguiente" habilita solo si se selecciona opción
- [ ] Descarte muestra mensaje correcto
- [ ] Lead calificado muestra alert de éxito
- [ ] Se guardan datos en MongoDB
- [ ] `lead_type` se asigna correctamente (Ideal/Scale)
- [ ] `status` es "applied" o "disqualified" según corresponda
- [ ] Meta Pixel trackea eventos (form_submitted, form_disqualified)
- [ ] Diseño responsivo funciona en móvil

---

## 📊 Ejemplo de respuesta del backend

**Caso de éxito (lead calificado):**
```json
{
  "success": true,
  "disqualified": false,
  "leadId": "507f1f77bcf86cd799439011",
  "lead_type": "Ideal"
}
```

**Caso de descalificación:**
```json
{
  "success": true,
  "disqualified": true,
  "leadId": "507f1f77bcf86cd799439012",
  "lead_type": null
}
```

---

## 📞 Soporte

Si algo no funciona:

1. **Verifica logs del backend:**
   ```
   Terminal del backend debe mostrar:
   POST /api/leads/apply-pilot
   ```

2. **Verifica console del frontend:**
   ```
   F12 → Console
   Debe estar limpia (sin errores rojos)
   ```

3. **Verifica MongoDB:**
   ```
   Debe haber un documento nuevo en collection leads
   ```

---

**¡Listo para testing! 🎉**
