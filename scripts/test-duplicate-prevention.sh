#!/bin/bash
# Script para probar la prevención de duplicados en bookings

echo "🧪 Testing duplicate booking prevention..."
echo ""

# Test data
EMAIL="test.duplicate@example.com"
NAME="Test User"
PHONE="1234567890"
COMPANY="Test Company"
DATE="2026-02-15"
TIME="10:00"
MESSAGE="Test message"

echo "📝 Test Data:"
echo "  Email: $EMAIL"
echo "  Name: $NAME"
echo "  Date: $DATE"
echo "  Time: $TIME"
echo ""

# First booking attempt
echo "1️⃣ Creating first booking..."
RESPONSE1=$(curl -s -X POST http://localhost:5001/api/booking/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"phone\": \"$PHONE\",
    \"company\": \"$COMPANY\",
    \"date\": \"$DATE\",
    \"time\": \"$TIME\",
    \"message\": \"$MESSAGE\"
  }")

echo "Response:"
echo "$RESPONSE1" | jq '.' 2>/dev/null || echo "$RESPONSE1"

# Extract booking ID if successful
BOOKING_ID=$(echo "$RESPONSE1" | jq -r '.booking.id // empty' 2>/dev/null)
if [ -z "$BOOKING_ID" ]; then
  echo "❌ First booking failed"
  exit 1
fi

echo ""
echo "✓ First booking created: $BOOKING_ID"
echo ""

# Second booking attempt (should fail)
echo "2️⃣ Attempting to create duplicate booking..."
RESPONSE2=$(curl -s -X POST http://localhost:5001/api/booking/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME Different\",
    \"email\": \"$EMAIL\",
    \"phone\": \"9876543210\",
    \"company\": \"Different Company\",
    \"date\": \"$DATE\",
    \"time\": \"$TIME\",
    \"message\": \"Different message\"
  }")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5001/api/booking/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME Different\",
    \"email\": \"$EMAIL\",
    \"phone\": \"9876543210\",
    \"company\": \"Different Company\",
    \"date\": \"$DATE\",
    \"time\": \"$TIME\",
    \"message\": \"Different message\"
  }")

echo "Response (HTTP Code: $HTTP_CODE):"
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

# Check results
if echo "$RESPONSE2" | grep -q "Ya existe una cita agendada"; then
  echo "✅ Duplicate prevention WORKING! Got expected error message"
  echo ""
  
  # Verify only one booking exists
  echo "3️⃣ Verifying database..."
  COUNT=$(mongosh stivenads-production --eval "db.bookings.countDocuments({email: '$EMAIL'})" 2>/dev/null | tail -1)
  echo "Total bookings for $EMAIL: $COUNT"
  
  if [ "$COUNT" = "1" ]; then
    echo "✅ Database integrity verified - only 1 booking exists"
  else
    echo "⚠️  Warning: Expected 1 booking, found $COUNT"
  fi
else
  echo "❌ Duplicate prevention NOT WORKING - second booking was created!"
fi

echo ""
echo "🧹 Cleaning up test data..."
mongosh stivenads-production --eval "db.bookings.deleteMany({email: '$EMAIL'})" >/dev/null 2>&1
echo "✓ Test data cleaned up"
