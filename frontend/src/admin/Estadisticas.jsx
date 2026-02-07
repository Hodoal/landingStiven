import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiTrendingUp, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import './Estadisticas.css';

export default function Estadisticas() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    scheduledMeetings: 0,
    completedMeetings: 0,
    missedMeetings: 0,
    totalRevenue: 0,
    soldClients: 0,
    conversionRate: 0,
    meetingCompletionRate: 0,
    averageTicket: 0
  });
  const [changes, setChanges] = useState({
    totalLeadsChange: 0,
    qualifiedLeadsChange: 0,
    scheduledMeetingsChange: 0,
    completedMeetingsChange: 0,
    missedMeetingsChange: 0,
    soldClientsChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch all leads
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
      const leadsResponse = await axios.get(`${API_BASE_URL}/leads/admin/leads`);
      const fetchedLeads = leadsResponse.data.data;
      
      // Fetch all bookings
      const bookingsResponse = await axios.get(`${API_BASE_URL}/booking/list`);
      const fetchedBookings = bookingsResponse.data.success ? bookingsResponse.data.bookings : [];

      // Calculate statistics
      calculateStats(fetchedLeads, fetchedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leads, bookings) => {
    // Calculate statistics based on current data and states
    // Primero separar por estado para evitar duplicados
    const disqualifiedLeads = leads.filter(l => l.status === 'No califica');
    const soldLeads = leads.filter(l => l.status === 'sold');
    
    // Leads calificados: tienen tipo Ideal/Scale Y no están descalificados ni vendidos
    const qualifiedLeads = leads.filter(l => 
      (l.lead_type === 'Ideal' || l.lead_type === 'Scale') && 
      l.status !== 'No califica' && 
      l.status !== 'sold'
    );
    
    // Total del sistema: mismo filtro que ClientsList para consistencia
    // Contar SOLO los leads que aparecen en el panel de Clientes Potenciales
    // Esto es: leads calificados (Ideal o Scale) que NO están descalificados
    const totalSystemLeads = qualifiedLeads.length;
    
    const totalRevenue = soldLeads.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);
    
    const scheduledBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'No Confirmado');
    const completedBookings = bookings.filter(b => b.status === 'meeting-completed');
    const missedBookings = bookings.filter(b => b.status === 'cancelled');

    // Calculate percentages based on states and totals
    const qualificationRate = totalSystemLeads > 0 
      ? ((qualifiedLeads.length / totalSystemLeads) * 100).toFixed(1)
      : 0;
    
    const disqualificationRate = totalSystemLeads > 0
      ? ((disqualifiedLeads.length / totalSystemLeads) * 100).toFixed(1)
      : 0;
    
    const scheduledRate = qualifiedLeads.length > 0
      ? ((scheduledBookings.length / qualifiedLeads.length) * 100).toFixed(1)
      : 0;
    
    const completionRate = scheduledBookings.length > 0
      ? ((completedBookings.length / scheduledBookings.length) * 100).toFixed(1)
      : 0;
    
    const missedRate = scheduledBookings.length > 0
      ? ((missedBookings.length / scheduledBookings.length) * 100).toFixed(1)
      : 0;

    const conversionRate = qualifiedLeads.length > 0 
      ? ((soldLeads.length / qualifiedLeads.length) * 100).toFixed(2)
      : 0;
    
    const meetingCompletionRate = scheduledBookings.length > 0
      ? ((completedBookings.length / scheduledBookings.length) * 100).toFixed(2)
      : 0;
    
    const averageTicket = soldLeads.length > 0
      ? (totalRevenue / soldLeads.length).toFixed(2)
      : 0;

    setStats({
      totalLeads: totalSystemLeads,
      qualifiedLeads: qualifiedLeads.length,
      scheduledMeetings: scheduledBookings.length,
      completedMeetings: completedBookings.length,
      missedMeetings: missedBookings.length,
      totalRevenue: totalRevenue.toFixed(2),
      soldClients: soldLeads.length,
      conversionRate,
      meetingCompletionRate,
      averageTicket
    });

    setChanges({
      totalLeadsChange: totalSystemLeads, // Total count for display
      qualifiedLeadsChange: qualificationRate, // % of qualified leads
      scheduledMeetingsChange: scheduledRate, // % of qualified that scheduled
      completedMeetingsChange: completionRate, // % of scheduled that completed
      missedMeetingsChange: missedRate, // % of scheduled that missed
      soldClientsChange: conversionRate // % of qualified that converted
    });
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
      <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
      <p>Cargando estadísticas...</p>
    </div>
  );

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Estadísticas y Métricas</h2>
        <button 
          onClick={fetchStatistics}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FiRefreshCw size={16} /> Actualizar
        </button>
      </div>
      
      {error && <p style={{ color: '#ef4444', marginBottom: '20px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</p>}

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Total de Clientes Potenciales</span>
              <span className="stat-change neutral">
                Total en sistema
              </span>
            </div>
            <p className="stat-value">{stats.totalLeads}</p>
            <p className="stat-description">Clientes potenciales registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Clientes Potenciales Calificados</span>
              <span className={`stat-change ${parseFloat(changes.qualifiedLeadsChange) >= 50 ? 'positive' : 'negative'}`}>
                {parseFloat(changes.qualifiedLeadsChange) >= 50 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                {' '}{changes.qualifiedLeadsChange}% del total
              </span>
            </div>
            <p className="stat-value">{stats.qualifiedLeads}</p>
            <p className="stat-description">Tipo Ideal o Scale</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Reuniones Agendadas</span>
              <span className={`stat-change ${parseFloat(changes.scheduledMeetingsChange) >= 70 ? 'positive' : 'negative'}`}>
                {parseFloat(changes.scheduledMeetingsChange) >= 70 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                {' '}{changes.scheduledMeetingsChange}% agendó
              </span>
            </div>
            <p className="stat-value">{stats.scheduledMeetings}</p>
            <p className="stat-description">Próximas reuniones</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Reuniones Completadas</span>
              <span className={`stat-change ${parseFloat(changes.completedMeetingsChange) >= 80 ? 'positive' : 'negative'}`}>
                {parseFloat(changes.completedMeetingsChange) >= 80 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                {' '}{changes.completedMeetingsChange}% completó
              </span>
            </div>
            <p className="stat-value">{stats.completedMeetings}</p>
            <p className="stat-description">Reuniones realizadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Reuniones No Realizadas</span>
              <span className={`stat-change ${parseFloat(changes.missedMeetingsChange) <= 15 ? 'positive' : 'negative'}`}>
                {parseFloat(changes.missedMeetingsChange) <= 15 ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
                {' '}{changes.missedMeetingsChange}% no asistió
              </span>
            </div>
            <p className="stat-value">{stats.missedMeetings}</p>
            <p className="stat-description">Canceladas o no presentadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Clientes Confirmados</span>
              <span className={`stat-change ${parseFloat(changes.soldClientsChange) >= 10 ? 'positive' : 'negative'}`}>
                {parseFloat(changes.soldClientsChange) >= 10 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                {' '}{changes.soldClientsChange}% conversión
              </span>
            </div>
            <p className="stat-value">{stats.soldClients}</p>
            <p className="stat-description">Clientes pagados</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Ingresos Totales</span>
          </div>
          <p className="metric-value">${stats.totalRevenue}</p>
          <p className="metric-description">Ingresos acumulados del período</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Tasa de Conversión</span>
          </div>
          <p className="metric-value">{stats.conversionRate}%</p>
          <p className="metric-description">Clientes potenciales convertidos a clientes</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Tasa de Cumplimiento</span>
          </div>
          <p className="metric-value">{stats.meetingCompletionRate}%</p>
          <p className="metric-description">Reuniones completadas exitosamente</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Ticket Promedio</span>
          </div>
          <p className="metric-value">${stats.averageTicket}</p>
          <p className="metric-description">Valor promedio por cliente</p>
        </div>
      </div>
    </div>
  );
}
