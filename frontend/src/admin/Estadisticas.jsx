import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Estadisticas() {
  const [stats, setStats] = useState({
    visitantes: 0,
    consultasAgendadas: 0,
    consultasConfirmadas: 0,
    ventasRealizadas: 0,
    tasaConversion: 0,
    tasaCierre: 0,
    ingresoTotal: 0,
    valorPromedio: 0,
    consultasEstasMes: 0,
    ventasEstasMes: 0,
    ingresosMes: 0
  });
  const [chartData, setChartData] = useState({
    ingresoDiario: [],
    embudo: [],
    ingreso30dias: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/booking/list');
      
      if (response.data.success && response.data.bookings) {
        const bookings = response.data.bookings;
        
        // Métricas de embudo de marketing
        const totalVisitantes = bookings.length; // Total de bookings creados
        const consultasAgendadas = bookings.filter(b => b.status !== 'cancelled').length; // No canceladas
        const consultasConfirmadas = bookings.filter(b => ['confirmed', 'meeting-completed'].includes(b.status)).length; // Confirmadas o reunión completada
        const ventasRealizadas = bookings.filter(b => b.venta_confirmada === true || b.status === 'sold').length; // Con venta cerrada
        const totalIngresos = bookings.reduce((sum, b) => sum + (b.monto_venta || 0), 0);
        
        // Tasa de conversión = Consultadas / Agendadas
        const tasaConversion = consultasAgendadas > 0 
          ? ((consultasConfirmadas / consultasAgendadas) * 100).toFixed(1) 
          : 0;
        
        // Tasa de cierre = Ventas / Consultadas
        const tasaCierre = consultasConfirmadas > 0 
          ? ((ventasRealizadas / consultasConfirmadas) * 100).toFixed(1) 
          : 0;
        
        // Valor promedio por venta
        const valorPromedio = ventasRealizadas > 0 
          ? (totalIngresos / ventasRealizadas).toFixed(0) 
          : 0;

        // Datos del mes actual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const consultasEstasMes = bookings.filter(b => {
          try {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          } catch (e) {
            return false;
          }
        }).length;

        const ventasEstasMes = bookings.filter(b => {
          try {
            const bookingDate = new Date(b.date);
            return (b.venta_confirmada === true || b.status === 'sold') && 
                   bookingDate.getMonth() === currentMonth && 
                   bookingDate.getFullYear() === currentYear;
          } catch (e) {
            return false;
          }
        }).length;

        const ingresosMes = bookings.filter(b => {
          try {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          } catch (e) {
            return false;
          }
        }).reduce((sum, b) => sum + (b.monto_venta || 0), 0);

        setStats({
          visitantes: totalVisitantes,
          consultasAgendadas,
          consultasConfirmadas,
          ventasRealizadas,
          tasaConversion,
          tasaCierre,
          ingresoTotal: totalIngresos,
          valorPromedio,
          consultasEstasMes,
          ventasEstasMes,
          ingresosMes
        });

        // Datos de ingreso diario últimos 30 días
        const ingresoDiarioMap = {};
        bookings.forEach(b => {
          try {
            const bookingDate = new Date(b.date);
            const dayKey = bookingDate.toLocaleDateString('es-CO');
            if (!ingresoDiarioMap[dayKey]) {
              ingresoDiarioMap[dayKey] = { dia: dayKey, ingreso: 0, ventas: 0 };
            }
            if (b.venta_confirmada === true || b.status === 'sold') {
              ingresoDiarioMap[dayKey].ingreso += b.monto_venta || 0;
              ingresoDiarioMap[dayKey].ventas += 1;
            }
          } catch (e) {}
        });

        const ingreso30dias = Object.values(ingresoDiarioMap)
          .sort((a, b) => new Date(a.dia) - new Date(b.dia))
          .slice(-30);

        // Embudo de conversión
        const embudoData = [
          { name: 'Visitantes', value: totalVisitantes, fill: '#3b82f6' },
          { name: 'Consultadas', value: consultasConfirmadas, fill: '#10b981' },
          { name: 'Ventas Cerradas', value: ventasRealizadas, fill: '#fbbf24' }
        ];

        setChartData({
          ingreso30dias,
          embudo: embudoData,
          ingresoDiario: ingreso30dias
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Métricas & Analytics</h2>
        <button 
          onClick={fetchStats}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Actualizar
        </button>
      </div>

      {/* KPIs Principales - Embudo de Ventas */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Embudo de Ventas (Funnel)</h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card">
            <h3>Visitantes / Consultas</h3>
            <p className="stat-value">{loading ? '-' : stats.visitantes}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Total de personas interesadas</p>
          </div>
          <div className="stat-card">
            <h3>Consultas Confirmadas</h3>
            <p className="stat-value">{loading ? '-' : stats.consultasConfirmadas}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Completaron la asesoría</p>
          </div>
          <div className="stat-card">
            <h3>Ventas Cerradas</h3>
            <p className="stat-value" style={{ color: '#22c55e' }}>{loading ? '-' : stats.ventasRealizadas}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Clientes que compraron</p>
          </div>
          <div className="stat-card">
            <h3>Ingresos Totales</h3>
            <p className="stat-value" style={{ color: '#22c55e' }}>{loading ? '-' : formatCurrency(stats.ingresoTotal)}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Todas las ventas</p>
          </div>
        </div>
      </div>

      {/* KPIs de Tasas de Conversión */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Tasas de Conversión</h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card">
            <h3>Tasa de Conversión</h3>
            <p className="stat-value" style={{ color: '#3b82f6' }}>{loading ? '-' : `${stats.tasaConversion}%`}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Visita → Consulta</p>
          </div>
          <div className="stat-card">
            <h3>Tasa de Cierre</h3>
            <p className="stat-value" style={{ color: '#22c55e' }}>{loading ? '-' : `${stats.tasaCierre}%`}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Consulta → Venta</p>
          </div>
          <div className="stat-card">
            <h3>Valor Promedio</h3>
            <p className="stat-value" style={{ color: '#fbbf24' }}>{loading ? '-' : formatCurrency(stats.valorPromedio)}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Por venta cerrada</p>
          </div>
          <div className="stat-card">
            <h3>ROI de Asesorías</h3>
            <p className="stat-value" style={{ color: '#ec4899' }}>
              {loading ? '-' : stats.consultasConfirmadas > 0 ? `${((stats.ventasRealizadas / stats.consultasConfirmadas) * 100).toFixed(0)}%` : '0%'}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Asesorías convertidas</p>
          </div>
        </div>
      </div>

      {/* Mes Actual */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>Este Mes</h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card">
            <h3>Consultas Programadas</h3>
            <p className="stat-value">{loading ? '-' : stats.consultasEstasMes}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Este mes</p>
          </div>
          <div className="stat-card">
            <h3>Ventas Cerradas</h3>
            <p className="stat-value" style={{ color: '#22c55e' }}>{loading ? '-' : stats.ventasEstasMes}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Este mes</p>
          </div>
          <div className="stat-card">
            <h3>Ingresos del Mes</h3>
            <p className="stat-value" style={{ color: '#22c55e' }}>{loading ? '-' : formatCurrency(stats.ingresosMes)}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Este mes</p>
          </div>
          <div className="stat-card">
            <h3>Promedio Diario</h3>
            <p className="stat-value" style={{ color: '#fbbf24' }}>
              {loading ? '-' : formatCurrency(stats.consultasEstasMes > 0 ? stats.ingresosMes / stats.consultasEstasMes : 0)}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Por consulta</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {!loading && (
        <>
          {/* Gráfico de Ingresos - Últimos 30 días */}
          {chartData.ingreso30dias.length > 0 && (
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Ingresos Últimos 30 Días</h3>
              <div style={{ background: '#1e293b', borderRadius: '6px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.ingreso30dias}>
                    <defs>
                      <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="dia" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(34, 197, 94, 0.5)', borderRadius: '6px' }}
                      formatter={(value) => [formatCurrency(value), 'Ingresos']}
                    />
                    <Area type="monotone" dataKey="ingreso" stroke="#22c55e" fillOpacity={1} fill="url(#colorIngreso)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Embudo de Conversión */}
          {chartData.embudo.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Embudo de Conversión</h3>
              <div style={{ background: '#1e293b', borderRadius: '6px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.embudo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px' }}
                      cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#fbbf24" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && chartData.ingreso30dias.length === 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>No hay datos de ventas disponibles. Comienza a registrar ventas para ver el análisis.</p>
        </div>
      )}
    </div>
  );
}
