#!/bin/bash

echo "🧪 Debug completo de ClientsList API"
echo "=================================="
echo

echo "1. Raw leads data:"
curl -s "http://localhost:5002/api/leads/admin/leads" | jq '.data[] | {id: ._id, name: .full_name, email: .email, type: .lead_type, status: .status, scheduled_date: .scheduled_date, scheduled_time: .scheduled_time}' | head -8

echo
echo "2. Qualified leads (Scale/Ideal, not sold/No califica):"
curl -s "http://localhost:5002/api/leads/admin/leads" | jq -r '.data[] | select(.lead_type == "Scale" or .lead_type == "Ideal") | select(.status != "No califica" and .status != "sold") | [.full_name, .email, .lead_type, .status, (.scheduled_date // "null"), (.scheduled_time // "null")] | @tsv'

echo
echo "3. Bookings data:"
curl -s "http://localhost:5002/api/booking/list" | jq '.bookings | length' | xargs -I {} echo "Total bookings: {}"

echo
echo "4. Simulating frontend logic:"
echo "   - Qualified leads count: $(curl -s "http://localhost:5002/api/leads/admin/leads" | jq -r '[.data[] | select(.lead_type == "Scale" or .lead_type == "Ideal") | select(.status != "No califica" and .status != "sold")] | length')"
echo "   - Bookings count: $(curl -s "http://localhost:5002/api/booking/list" | jq -r '.bookings | length')"

echo
echo "5. Expected results in frontend:"
echo "   Based on the logic, should show exactly 4 clients (all qualified leads since there are 0 bookings)"

echo
echo "✅ Debug complete - check above data against frontend display"