// Test end-to-end: Crear un cliente (lead + booking) y luego eliminarlo

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEndToEnd() {
  try {
    console.log('🌐 INICIANDO TEST END-TO-END DE ELIMINACIÓN\n');
    console.log('='.repeat(60));

    // PASO 1: Crear un lead
    console.log('\n1️⃣  CREAR LEAD...');
    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const leadResponse = await axios.post(`${API_BASE}/leads/submit-application`, {
      full_name: 'E2E Test Client',
      email: testEmail,
      phone: '3001234567',
      is_labor_lawyer: false,
      works_quota_litis: 'No',
      monthly_consultations: '10–30',
      willing_to_invest_ads: false,
      main_problem: ['Testing end-to-end'],
      lead_type: 'Ideal',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:00'
    });

    const leadId = leadResponse.data.data._id;
    console.log(`✓ Lead creado: ${leadId}`);
    console.log(`  Email: ${testEmail}`);

    // PASO 2: Obtener el booking
    console.log('\n2️⃣  OBTENER BOOKING POR EMAIL...');
    const bookingResponse = await axios.get(`${API_BASE}/booking/by-email/${testEmail}`);
    
    let bookingId = null;
    if (!bookingResponse.data.success) {
      console.log('⚠️  No hay booking para este email (es posible)');
    } else {
      bookingId = bookingResponse.data.booking.id || bookingResponse.data.booking._id;
      console.log(`✓ Booking encontrado: ${bookingId}`);
    }

    // PASO 3: Verificar que ambos existen en el admin
    console.log('\n3️⃣  VERIFICAR ANTES DE ELIMINAR...');
    const adminLeadsBefore = await axios.get(`${API_BASE}/leads/admin/leads`);
    const leadExistsBefore = (adminLeadsBefore.data.data || []).some(l => l._id === leadId);
    console.log(`✓ Lead existe en admin: ${leadExistsBefore ? 'SÍ' : 'NO'}`);

    if (bookingId) {
      const bookingsBefore = await axios.get(`${API_BASE}/booking/list`);
      const bookingExistsBefore = (bookingsBefore.data.bookings || []).some(b => b.id === bookingId || b._id === bookingId);
      console.log(`✓ Booking existe: ${bookingExistsBefore ? 'SÍ' : 'NO'}`);
    }

    // PASO 4: ELIMINAR BOOKING (como hace el frontend)
    if (bookingId) {
      console.log('\n4️⃣  ELIMINAR BOOKING...');
      console.log(`   DELETE /api/booking/${bookingId}`);
      const deleteBookingRes = await axios.delete(`${API_BASE}/booking/${bookingId}`);
      console.log(`✓ Respuesta: ${deleteBookingRes.data.message}`);
    }

    // PASO 5: ELIMINAR LEAD (como hace el frontend)
    console.log('\n5️⃣  ELIMINAR LEAD...');
    console.log(`   DELETE /api/leads/${leadId}`);
    const deleteLeadRes = await axios.delete(`${API_BASE}/leads/${leadId}`);
    console.log(`✓ Respuesta: ${deleteLeadRes.data.message}`);

    // PASO 6: Esperar y verificar que se eliminó
    console.log('\n6️⃣  ESPERANDO 1 SEGUNDO PARA SINCRONIZACIÓN...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PASO 7: Verificar que se eliminó
    console.log('\n7️⃣  VERIFICAR DESPUÉS DE ELIMINAR...');
    const adminLeadsAfter = await axios.get(`${API_BASE}/leads/admin/leads`);
    const leadExistsAfter = (adminLeadsAfter.data.data || []).some(l => l._id === leadId);
    console.log(`✓ Lead existe después: ${leadExistsAfter ? 'SÍ (ERROR!)' : 'NO (correcto)'}`);

    let bookingExistsAfter = false;
    if (bookingId) {
      const bookingsAfter = await axios.get(`${API_BASE}/booking/list`);
      bookingExistsAfter = (bookingsAfter.data.bookings || []).some(b => b.id === bookingId || b._id === bookingId);
      console.log(`✓ Booking existe después: ${bookingExistsAfter ? 'SÍ (ERROR!)' : 'NO (correcto)'}`);
    }

    // RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    if (!leadExistsAfter && (!bookingId || !bookingExistsAfter)) {
      console.log('✅ PRUEBA EXITOSA: Eliminación end-to-end funciona correctamente');
    } else {
      console.log('❌ PRUEBA FALLIDA:');
      if (leadExistsAfter) console.log('   ❌ Lead aún existe');
      if (bookingId && bookingExistsAfter) console.log('   ❌ Booking aún existe');
    }
    console.log('='.repeat(60));

  } catch (err) {
    if (err.response) {
      console.error('❌ Error HTTP:', err.response.status);
      console.error('   ', err.response.data);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('❌ No se pudo conectar a http://localhost:3001');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

testEndToEnd();
