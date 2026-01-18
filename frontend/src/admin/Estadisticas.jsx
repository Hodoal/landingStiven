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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch all leads
      const leadsResponse = await axios.get('/api/leads/admin/leads');
      const fetchedLeads = leadsResponse.data.data;
      
      // Fetch all bookings
      const bookingsResponse = await axios.get('/api/booking/list');
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
    // Calculate statistics
    const qualifiedLeads = leads.filter(l => l.lead_type === 'Ideal' || l.lead_type === 'Scale');
    const soldLeads = leads.filter(l => l.status === 'sold');
    const totalRevenue = soldLeads.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);
    
    const scheduledBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'No Confirmado');
    const completedBookings = bookings.filter(b => b.status === 'meeting-completed');
    const missedBookings = bookings.filter(b => b.status === 'cancelled');

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
      totalLeads: leads.length,
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
              <span className="stat-label">Total de Leads</span>
              <span className="stat-change positive">
                <FiArrowUp size={14} /> 12%
              </span>
            </div>
            <p className="stat-value">{stats.totalLeads}</p>
            <p className="stat-description">Leads registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-card-header">
              <span className="stat-label">Leads Calificados</span>
              <span className="stat-change positive">
                <FiArrowUp size={14} /> 8%
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
              <span className="stat-change positive">
                <FiArrowUp size={14} /> 5%
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
              <span className="stat-change negative">
                <FiArrowDown size={14} /> 2%
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
              <span className="stat-change negative">
                <FiArrowDown size={14} /> 3%
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
              <span className="stat-change positive">
                <FiArrowUp size={14} /> 15%
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
          <p className="metric-description">Leads convertidos a clientes</p>
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
