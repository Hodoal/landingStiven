// Debug endpoint para ver exactamente qué está pasando con los leads
const express = require('express');

const app = express();
app.use(express.json());

// Simulación de datos para debug
app.get('/debug-leads', async (req, res) => {
    try {
        // Simular la misma lógica que el frontend
        const axios = require('axios');
        
        // 1. Obtener leads
        const leadsResponse = await axios.get('http://localhost:5002/api/leads/admin/leads');
        const allLeads = leadsResponse.data.data || [];
        
        console.log('📋 Total leads:', allLeads.length);
        
        // 2. Filtrar leads calificados (misma lógica que frontend)
        const qualifiedLeads = allLeads
            .filter(lead => lead.lead_type === 'Ideal' || lead.lead_type === 'Scale')
            .filter(lead => lead.status !== 'No califica' && lead.status !== 'sold');
        
        console.log('✓ Qualified leads:', qualifiedLeads.length);
        
        // 3. Obtener bookings
        const bookingsResponse = await axios.get('http://localhost:5002/api/booking/list');
        const allBookings = bookingsResponse.data.success ? bookingsResponse.data.bookings : [];
        
        console.log('📅 Total bookings:', allBookings.length);
        
        // 4. Procesar datos como en frontend
        const clientesData = [];
        const leadsWithBookings = new Set();
        
        // Agregar bookings primero
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
        
        // Agregar leads sin bookings
        qualifiedLeads.forEach(lead => {
            if (!leadsWithBookings.has(lead._id)) {
                const hasSchedule = lead.scheduled_date && lead.scheduled_time;
                const computedStatus = hasSchedule ? 'Agendado' : 'Pendiente de agendar';
                
                clientesData.push({
                    id: lead._id,
                    nombre: lead.full_name || 'N/A',
                    email: lead.email || 'N/A',
                    telefono: lead.phone || 'N/A',
                    fechaAgendamiento: lead.scheduled_date || 'Sin agendar',
                    horaAgendamiento: lead.scheduled_time || 'Sin agendar',
                    estado: computedStatus,
                    leadType: lead.lead_type || 'N/A',
                    source: 'lead'
                });
            }
        });
        
        // NO filtrar duplicados
        const clientesFiltrados = clientesData;
        
        res.json({
            success: true,
            debug: {
                totalLeads: allLeads.length,
                qualifiedLeads: qualifiedLeads.length,
                totalBookings: allBookings.length,
                leadsWithBookings: leadsWithBookings.size,
                finalClients: clientesFiltrados.length,
                qualifiedLeadsDetail: qualifiedLeads.map(l => ({
                    id: l._id,
                    name: l.full_name,
                    email: l.email,
                    type: l.lead_type,
                    status: l.status,
                    scheduled_date: l.scheduled_date,
                    scheduled_time: l.scheduled_time
                })),
                finalClientsDetail: clientesFiltrados
            }
        });
        
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Debug server running on http://localhost:${PORT}`);
});