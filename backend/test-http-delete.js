// Test HTTP de eliminación - Simula exactamente lo que hace el frontend

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testHTTPDelete() {
  try {
    console.log('🌐 Iniciando test HTTP de eliminación...\n');

    // 1. Crear un lead con POST
    console.log('1️⃣  CREANDO LEAD vía HTTP...');
    const leadResponse = await axios.post(`${API_BASE}/leads/submit-application`, {
      full_name: 'Test HTTP Delete',
      email: 'test-http-delete@example.com',
      phone: '3009876543',
      is_labor_lawyer: false,
      works_quota_litis: 'No',
      monthly_consultations: '10–30',
      willing_to_invest_ads: false,
      main_problem: ['Testing HTTP delete'],
      lead_type: 'Ideal'
    });

    const leadId = leadResponse.data.data._id;
    console.log('✓ Lead creado con ID:', leadId);

    // 2. Verificar que existe en el admin
    console.log('\n2️⃣  LISTANDO LEADS DEL ADMIN...');
    const listBefore = await axios.get(`${API_BASE}/leads/admin/leads`);
    console.log('   Estructura de respuesta:', Object.keys(listBefore.data));
    const leadsArrayBefore = listBefore.data.data || listBefore.data.leads || (Array.isArray(listBefore.data) ? listBefore.data : []);
    console.log('✓ Leads antes:', leadsArrayBefore.length);
    console.log('   Primer lead:', leadsArrayBefore[0]?.full_name);
    const existsBefore = leadsArrayBefore.some(l => l._id === leadId);
    console.log('  ¿Nuestro lead existe?', existsBefore ? 'SÍ' : 'NO');

    // 3. ELIMINAR el lead
    console.log('\n3️⃣  ELIMINANDO LEAD vía HTTP...');
    console.log('   DELETE /api/leads/' + leadId);
    const deleteResponse = await axios.delete(`${API_BASE}/leads/${leadId}`);
    console.log('✓ Respuesta:', deleteResponse.data.message);
    console.log('  Success:', deleteResponse.data.success);

    // 4. Verificar que se eliminó
    console.log('\n4️⃣  LISTANDO LEADS DESPUÉS DE ELIMINAR...');
    const listAfter = await axios.get(`${API_BASE}/leads/admin/leads`);
    const leadsArrayAfter = Array.isArray(listAfter.data) ? listAfter.data : listAfter.data.leads || [];
    console.log('✓ Leads después:', leadsArrayAfter.length);
    const existsAfter = leadsArrayAfter.some(l => l._id === leadId);
    console.log('  ¿Nuestro lead todavía existe?', existsAfter ? 'SÍ (ERROR!)' : 'NO (correcto)');

    // 5. Resultado final
    console.log('\n' + '='.repeat(50));
    if (!existsAfter && leadsArrayAfter.length === leadsArrayBefore.length - 1) {
      console.log('✅ PRUEBA EXITOSA: Eliminación HTTP funciona');
    } else {
      console.log('❌ PRUEBA FALLIDA');
      console.log('   - Diferencia de conteo:', leadsArrayBefore.length - leadsArrayAfter.length);
      console.log('   - Aún existe:', existsAfter);
    }
    console.log('='.repeat(50));

  } catch (err) {
    if (err.response) {
      console.error('❌ Error HTTP:', err.response.status, err.response.data);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('❌ Error: No se pudo conectar a http://localhost:3001');
      console.error('   ¿El servidor está ejecutándose?');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

testHTTPDelete();
