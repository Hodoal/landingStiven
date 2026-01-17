# ⚡ Quick Start - Sistema de Prueba Piloto

## 🎯 En 30 segundos

El sistema de prueba piloto es un **modal con 6 preguntas** que valida automáticamente si un usuario califica:

1. **Pregunta 1:** ¿Abogado laboral? → ❌ Si dice "No"
2. **Pregunta 2:** ¿Modelo cuota de litis?
3. **Pregunta 3:** ¿Consultas/mes? → ❌ Si es 0-10
4. **Pregunta 4:** ¿Invertir en ads? → ❌ Si dice "No"
5. **Pregunta 5:** ¿Presupuesto ads? → ❌ Si es <$1M
6. **Pregunta 6:** ¿Mayor problema? (múltiple)

**Resultado:**
- ✅ Si califica → Guardar como "applied" + tipo "Ideal" o "Scale"
- ❌ Si no califica → Guardar como "disqualified" + mostrar mensaje

---

## 🚀 Ejecutar

```bash
# Terminal 1: Backend
cd backend && node server.js

# Terminal 2: Frontend
cd frontend && npm run dev

# Abre: http://localhost:5173
```

---

## 📁 Archivos Principales

| Archivo | Qué hace |
|---------|----------|
| `frontend/src/components/PilotApplicationModal.jsx` | Modal con 6 preguntas |
| `frontend/src/components/PilotApplicationModal.css` | Estilos del modal |
| `backend/routes/leadsRoutes.js` | Rutas `/apply-pilot` y `/track-event` |
| `frontend/src/App.jsx` | Integración del modal |

---

## 💡 Lógica de Validación

```javascript
// Descarta automáticamente si CUALQUIERA es verdadero:
❌ is_labor_lawyer === "No"
❌ monthly_consultations === "0–10"
❌ willing_to_invest_ads === "No"
❌ ads_budget_range === "Menos de $1.000.000"

// Si pasa, clasifica:
lead_type = "Ideal"  // Si: 10-30 o 30-60 consultas
lead_type = "Scale"  // Si: 60+ consultas
```

---

## 📊 Qué se guarda en MongoDB

```javascript
{
  is_labor_lawyer: true,
  works_quota_litis: "Sí",
  monthly_consultations: "30–60",
  willing_to_invest_ads: true,
  ads_budget_range: "$2.000.000 – $4.000.000",
  main_problem: ["Muchas no califican", "Falta de tiempo"],
  
  // Auto-generado:
  lead_type: "Ideal",
  status: "applied",  // o "disqualified"
}
```

---

## 🧪 Test Rápido

1. **Caso éxito:** Responde todos con "Sí" → Lead guardado como "Ideal"
2. **Caso fallo:** Pregunta 1 = "No" → Descalificación automática

---

## 📚 Documentos

- `PILOT_APPLICATION_SYSTEM.md` - Documentación técnica completa
- `PILOT_SYSTEM_OVERVIEW.md` - Guía visual
- `TESTING_PILOT_SYSTEM.md` - 6 casos de test
- `PILOT_IMPLEMENTATION_SUMMARY.md` - Resumen ejecutivo

---

## ✅ Checklist

- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Modal se abre al hacer clic
- [ ] 6 preguntas se muestran secuencialmente
- [ ] Descarte muestra mensaje correcto
- [ ] Datos se guardan en MongoDB
- [ ] `lead_type` es "Ideal" o "Scale"
- [ ] Meta Pixel trackea eventos

---

## 🐛 Si no funciona

```bash
# Error "Cannot POST"
→ Verifica backend corriendo

# Error "CORS"
→ Backend tiene cors() middleware

# Lead no se guarda
→ Verifica MongoDB conectada

# Modal no se abre
→ Verifica App.jsx tiene <PilotApplicationModal />
```

---

## 🔗 URLs Importantes

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **MongoDB:** mongodb://localhost:27017/stivenads
- **GitHub:** https://github.com/Hodoal/landingStiven

---

**¡Listo para usar! 🎉**
