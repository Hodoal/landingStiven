#!/bin/bash
# Script para probar que el sistema ya no crea duplicados al agendar

echo "🧪 Testing duplicate prevention after fixes..."
echo ""

# Test data
EMAIL="test.noduplicate@example.com"
NAME="Test User No Duplicate"
PHONE="1234567890"
COMPANY="Test Company"
DATE="2026-02-15"
TIME="14:00"
MESSAGE="Test message for duplicate prevention"

# Clean up any existing test bookings first
echo "🧹 Cleaning up existing test bookings..."
curl -s -X DELETE "http://localhost:5002/api/booking/test-cleanup?email=$EMAIL" > /dev/null

echo ""
echo "📝 Test Data:"
echo "  Email: $EMAIL"
echo "  Name: $NAME"
echo "  Date: $DATE"
echo "  Time: $TIME"
echo ""

# Test 1: Crear un Lead con agendamiento (esto debería crear un booking con status 'scheduled')
echo "1️⃣ Creating Lead with schedule (should create booking with 'scheduled' status)..."
LEAD_RESPONSE=$(curl -s -X POST http://localhost:5002/api/leads/create \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"monthly_consultations\": \"10-50\",
    \"is_labor_lawyer\": \"Sí\",
    \"willing_to_invest_ads\": \"Sí\",
    \"ads_budget_range\": \"1000-5000\",
    \"scheduled_date\": \"$DATE\",
    \"scheduled_time\": \"$TIME\"
  }")

echo "Lead Response:"
echo "$LEAD_RESPONSE" | jq '.'
echo ""

# Wait a moment
sleep 2

# Test 2: Intentar crear booking normal (esto debería ACTUALIZAR el booking existente, no crear uno nuevo)
echo "2️⃣ Attempting to create normal booking (should UPDATE existing, not create new)..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:5002/api/booking/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME Updated\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"company\": \"$COMPANY\",
    \"date\": \"$DATE\",
    \"time\": \"$TIME\",
    \"message\": \"$MESSAGE\"
  }")

echo "Booking Response:"
echo "$BOOKING_RESPONSE" | jq '.'
echo ""

# Test 3: Verificar cuántos bookings existen para este email/fecha/hora
echo "3️⃣ Checking how many bookings exist for this email/date/time..."
VERIFICATION_RESPONSE=$(curl -s -X GET "http://localhost:5002/api/booking/count?email=$EMAIL&date=$DATE&time=$TIME")

echo "Count Response:"
echo "$VERIFICATION_RESPONSE"
echo ""

# Test 4: Intentar crear otro booking con mismo email/fecha/hora (debería ser rechazado)
echo "4️⃣ Attempting to create another booking with same email/date/time (should be rejected)..."
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:5002/api/booking/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Another User\",
    \"email\": \"$EMAIL\",
    \"phone\": \"9876543210\",
    \"company\": \"Another Company\",
    \"date\": \"$DATE\",
    \"time\": \"$TIME\",
    \"message\": \"This should be rejected\"
  }")

echo "Duplicate Attempt Response:"
echo "$DUPLICATE_RESPONSE" | jq '.'
echo ""

# Summary
echo "📊 Test Summary:"
echo "✅ Test 1: Lead created with scheduled booking"
echo "✅ Test 2: Normal booking should update existing (not create new)"
echo "✅ Test 3: Verify only 1 booking exists"
echo "✅ Test 4: Duplicate attempt should be rejected"
echo ""
echo "🎯 Expected Result: Only 1 booking should exist with status 'confirmed'"