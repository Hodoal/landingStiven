const axios = require('axios');

async function testAdminAPI() {
    try {
        console.log('🧪 Test de API Admin Frontend');
        
        // 1. Test leads API
        const API_BASE_URL = 'http://localhost:5002/api';
        const leadsResponse = await axios.get(`${API_BASE_URL}/leads/admin/leads`);
        const allLeads = leadsResponse.data.data || [];
        
        console.log(`📋 Total leads: ${allLeads.length}`);
        
        // 2. Filter qualified leads (same logic as frontend)
        const qualifiedLeads = allLeads
            .filter(lead => lead.lead_type === 'Ideal' || lead.lead_type === 'Scale')
            .filter(lead => lead.status !== 'No califica' && lead.status !== 'sold');
        
        console.log(`✓ Leads calificados: ${qualifiedLeads.length}`);
        console.log('Detalles de leads calificados:');
        qualifiedLeads.forEach(lead => {
            console.log(`  - ${lead.full_name} (${lead.email}) - ${lead.lead_type} - ${lead.status}`);
            console.log(`    Fecha: ${lead.scheduled_date || 'Sin fecha'} - Hora: ${lead.scheduled_time || 'Sin hora'}`);
            console.log(`    ID: ${lead._id}`);
        });
        
        // 3. Test bookings API
        const bookingsResponse = await axios.get(`${API_BASE_URL}/booking/list`);
        const allBookings = bookingsResponse.data.success ? bookingsResponse.data.bookings : [];
        
        console.log(`\n📅 Total bookings: ${allBookings.length}`);
        
        // 4. Simulate frontend logic
        const clientesData = [];
        const leadsWithBookings = new Set();
        
        // Add bookings first
        allBookings.forEach(booking => {
            const correspondingLead = qualifiedLeads.find(l => l.email === booking.email);
            if (booking.status !== 'sold') {
                if (correspondingLead) {
                    leadsWithBookings.add(correspondingLead._id);
                }
                clientesData.push({
                    id: booking.id || booking._id,
                    nombre: booking.clientName || 'N/A',
                    email: booking.email || 'N/A',
                    source: 'booking'
                });
            }
        });
        
        // Add leads without bookings
        qualifiedLeads.forEach(lead => {
            if (!leadsWithBookings.has(lead._id)) {
                clientesData.push({
                    id: lead._id,
                    nombre: lead.full_name || 'N/A',
                    email: lead.email || 'N/A',
                    source: 'lead'
                });
            }
        });
        
        console.log(`\n🎯 Clientes finales que deberían mostrarse: ${clientesData.length}`);
        clientesData.forEach(cliente => {
            console.log(`  - ${cliente.nombre} (${cliente.email}) - Source: ${cliente.source}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAdminAPI();