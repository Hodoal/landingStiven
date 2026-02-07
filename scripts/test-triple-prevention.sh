#!/bin/bash
# Test completo de prevención de duplicados en leads

echo "🧪 Testing complete duplicate prevention..."
echo ""

EMAIL="test.triple.prevention@example.com"
NAME="Test Triple Prevention"
PHONE="1234567890"

echo "📝 Test Data:"
echo "  Email: $EMAIL"
echo "  Name: $NAME"
echo ""

# Test 1: Crear el primer lead (debe funcionar)
echo "1️⃣ Creating first lead (should succeed)..."
RESPONSE1=$(curl -s -X POST https://stivenads.com/api/leads/submit-application \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"$NAME 1\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"monthly_consultations\": \"30–60\",
    \"is_labor_lawyer\": \"Sí\",
    \"willing_to_invest_ads\": \"Sí\",
    \"ads_budget_range\": \"3000-10000\",
    \"scheduled_date\": \"2026-02-20\",
    \"scheduled_time\": \"10:00\"
  }")

echo "First Lead Response:"
echo "$RESPONSE1" | jq '.'
echo ""

# Esperar un momento
sleep 2

# Test 2: Intentar crear segundo lead con mismo email (debe ser rechazado)
echo "2️⃣ Attempting to create second lead with same email (should be rejected)..."
RESPONSE2=$(curl -s -X POST https://stivenads.com/api/leads/submit-application \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"$NAME 2\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"monthly_consultations\": \"60+\",
    \"is_labor_lawyer\": \"Sí\",
    \"willing_to_invest_ads\": \"Sí\",
    \"ads_budget_range\": \"10000+\",
    \"scheduled_date\": \"2026-02-20\",
    \"scheduled_time\": \"11:00\"
  }")

echo "Second Lead Response:"
echo "$RESPONSE2" | jq '.'
echo ""

# Test 3: Intentar crear tercer lead con mismo email (debe ser rechazado)
echo "3️⃣ Attempting to create third lead with same email (should be rejected)..."
RESPONSE3=$(curl -s -X POST https://stivenads.com/api/leads/submit-application \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"$NAME 3\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"monthly_consultations\": \"10-30\",
    \"is_labor_lawyer\": \"Sí\",
    \"willing_to_invest_ads\": \"Sí\",
    \"ads_budget_range\": \"1000-3000\",
    \"scheduled_date\": \"2026-02-20\",
    \"scheduled_time\": \"12:00\"
  }")

echo "Third Lead Response:"
echo "$RESPONSE3" | jq '.'
echo ""

# Test 4: Verificar cuántos leads existen para este email
echo "4️⃣ Checking how many leads exist for this email..."
LEAD_COUNT=$(curl -s "https://stivenads.com/api/leads/admin/leads" | jq ".data | map(select(.email == \"$EMAIL\")) | length")
BOOKING_COUNT=$(curl -s "https://stivenads.com/api/booking/list" | jq ".bookings | map(select(.email == \"$EMAIL\")) | length")

echo "Leads with email $EMAIL: $LEAD_COUNT"
echo "Bookings with email $EMAIL: $BOOKING_COUNT"
echo ""

# Verificar resultados
echo "📊 Test Results:"
SUCCESS1=$(echo "$RESPONSE1" | jq -r '.success // false')
SUCCESS2=$(echo "$RESPONSE2" | jq -r '.success // false')
SUCCESS3=$(echo "$RESPONSE3" | jq -r '.success // false')

if [ "$SUCCESS1" = "true" ] && [ "$SUCCESS2" = "false" ] && [ "$SUCCESS3" = "false" ] && [ "$LEAD_COUNT" = "1" ]; then
  echo "✅ ALL TESTS PASSED!"
  echo "  ✅ First lead created successfully"
  echo "  ✅ Second lead rejected (duplicate)"
  echo "  ✅ Third lead rejected (duplicate)"
  echo "  ✅ Only 1 lead exists in database"
  echo ""
  echo "🎯 DUPLICATE PREVENTION WORKING CORRECTLY"
else
  echo "❌ TESTS FAILED!"
  echo "  First lead success: $SUCCESS1"
  echo "  Second lead success: $SUCCESS2"
  echo "  Third lead success: $SUCCESS3"
  echo "  Lead count: $LEAD_COUNT"
  echo "  Booking count: $BOOKING_COUNT"
fi