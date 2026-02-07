#!/bin/bash

# Test script to send a lead that should be disqualified
curl -X POST http://localhost:5000/api/leads/apply-pilot \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Usuario",
    "email": "test-usuario@example.com",
    "phone": "3001234567",
    "is_labor_lawyer": "No",
    "works_quota_litis": "No",
    "monthly_consultations": "30–60",
    "willing_to_invest_ads": "Sí",
    "ads_budget_range": "Entre $1M y $5M",
    "main_problem": ["Muchas no califican"]
  }' | jq .
