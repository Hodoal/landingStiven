#!/bin/bash

# Script de verificación rápida del sistema de leads
# Fecha: 21 de Enero, 2026

echo "======================================"
echo "🔍 VERIFICACIÓN DEL SISTEMA DE LEADS"
echo "======================================"
echo ""

# Verificar que el backend está corriendo
echo "1️⃣ Verificando backend..."
if curl -s http://localhost:3001/api/health > /dev/null; then
  echo "   ✅ Backend está corriendo en puerto 3001"
else
  echo "   ❌ Backend NO está respondiendo"
  exit 1
fi
echo ""

# Contar leads totales
echo "2️⃣ Contando leads en base de datos..."
TOTAL=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | length')
echo "   📊 Total de leads: $TOTAL"
echo ""

# Contar leads que NO califican
echo "3️⃣ Contando leads que NO califican..."
NO_CALIFICAN=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "No califica")) | length')
echo "   ❌ Leads que NO califican: $NO_CALIFICAN"
echo ""

# Contar leads que SÍ califican
echo "4️⃣ Contando leads que SÍ califican..."
CALIFICAN=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status != "No califica" and .status != "sold")) | length')
echo "   ✅ Leads que SÍ califican: $CALIFICAN"
echo ""

# Contar por tipo de lead
echo "5️⃣ Clasificación de leads que califican..."
IDEAL=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.lead_type == "Ideal")) | length')
SCALE=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.lead_type == "Scale")) | length')
echo "   🎯 Leads tipo 'Ideal': $IDEAL"
echo "   📈 Leads tipo 'Scale': $SCALE"
echo ""

# Contar por status
echo "6️⃣ Distribución por status..."
APPLIED=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "applied")) | length')
SCHEDULED=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "scheduled")) | length')
MEETING_COMPLETED=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "meeting-completed")) | length')
SOLD=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "sold")) | length')
echo "   📝 Applied: $APPLIED"
echo "   📅 Scheduled: $SCHEDULED"
echo "   ✅ Meeting Completed: $MEETING_COMPLETED"
echo "   💰 Sold: $SOLD"
echo "   ❌ No califica: $NO_CALIFICAN"
echo ""

# Mostrar ejemplo de lead que no califica
echo "7️⃣ Ejemplo de lead que NO califica:"
curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "No califica")) | .[0] | {
  nombre: .full_name,
  email: .email,
  status: .status,
  razon: .disqualified_reason,
  fecha: .disqualified_at
}' 2>/dev/null || echo "   No hay leads que no califiquen"
echo ""

# Mostrar ejemplo de lead que sí califica
echo "8️⃣ Ejemplo de lead que SÍ califica:"
curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status != "No califica" and .status != "sold")) | .[0] | {
  nombre: .full_name,
  email: .email,
  status: .status,
  tipo: .lead_type,
  fecha_agendada: .scheduled_date
}' 2>/dev/null || echo "   No hay leads que califiquen"
echo ""

# Resumen
echo "======================================"
echo "📊 RESUMEN"
echo "======================================"
echo "Total de leads: $TOTAL"
echo "  - Que califican: $CALIFICAN ($IDEAL Ideal + $SCALE Scale)"
echo "  - Que NO califican: $NO_CALIFICAN"
echo ""
echo "Status:"
echo "  - Applied: $APPLIED"
echo "  - Scheduled: $SCHEDULED"
echo "  - Meeting Completed: $MEETING_COMPLETED"
echo "  - Sold: $SOLD"
echo "  - No califica: $NO_CALIFICAN"
echo ""

# Verificar que los campos requeridos estén presentes
echo "9️⃣ Verificando campos requeridos en leads que no califican..."
MISSING_FIELDS=$(curl -s http://localhost:3001/api/leads/admin/leads | jq '.data | map(select(.status == "No califica")) | map(select(.disqualified_reason == null or .disqualified_at == null)) | length')
if [ "$MISSING_FIELDS" -eq 0 ]; then
  echo "   ✅ Todos los leads que no califican tienen campos completos"
else
  echo "   ⚠️  $MISSING_FIELDS leads no califican sin campos completos"
fi
echo ""

echo "✅ Verificación completada"
echo "======================================"
