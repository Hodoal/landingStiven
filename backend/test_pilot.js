const axios = require('axios');

const testData = {
  is_labor_lawyer: 'Sí',
  works_quota_litis: 'Sí',
  monthly_consultations: '30–60',
  willing_to_invest_ads: 'Sí',
  ads_budget_range: '$2.000.000 - $4.000.000',
  main_problem: ['Muchas no califican'],
  name: 'Test User',
  email: 'test@example.com',
  phone: '+57 3001234567',
  scheduled_date: '2026-01-25',
  scheduled_time: '10:00'
};

axios.post('http://localhost:3001/api/leads/apply-pilot', testData)
  .then(res => {
    console.log('✅ Success:', JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error('❌ Error:', err.response?.data || err.message);
  });
