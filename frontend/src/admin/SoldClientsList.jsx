import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiTrash2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './ClientsList.css';

export default function SoldClientsList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      
      // Fetch sold bookings
      const bookingsResponse = await axios.get('/api/booking/list');
      const soldBookings = bookingsResponse.data.success 
        ? bookingsResponse.data.bookings.filter(b => b.status === 'sold')
        : [];

      // Fetch sold leads
      const leadsResponse = await axios.get('/api/leads/admin/leads');
      const soldLeads = leadsResponse.data.data.filter(lead => lead.status === 'sold');

      // Combinar ambos (bookings y leads vendidos)
      const clientesData = [];

      // Agregar bookings vendidos
      soldBookings.forEach(booking => {
        clientesData.push({
          id: booking.id,
          nombre: booking.clientName || 'N/A',
          email: booking.email || 'N/A',
          telefono: booking.phone || 'N/A',
          fecha: booking.date || 'N/A',
          hora: booking.time || 'N/A',
          montoVenta: booking.monto_venta || 0,
          fechaVenta: booking.fecha_venta || 'N/A',
          tipo: 'Booking'
        });
      });

      // Agregar leads vendidos
      soldLeads.forEach(lead => {
        clientesData.push({
          id: lead._id,
          nombre: lead.full_name || 'N/A',
          email: lead.email || 'N/A',
          telefono: lead.phone || 'N/A',
          fecha: lead.scheduled_date || 'N/A',
          hora: lead.scheduled_time || 'N/A',
          montoVenta: lead.sale_amount || 0,
          fechaVenta: lead.sold_at || 'N/A',
          tipo: 'Lead'
        });
      });

      setClientes(clientesData);
      setError(null);
    } catch (err) {
      setError('Error al cargar clientes: ' + err.message);
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Eliminar cliente ${name}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/booking/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setClientes(clientes.filter(c => c.id !== id));
        } else {
          alert('Error al eliminar');
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = clientes.map(cliente => ({
      'Nombre': cliente.nombre,
      'Email': cliente.email,
      'Teléfono': cliente.telefono,
      'Fecha': cliente.fecha,
      'Hora': cliente.hora,
      'Monto Venta': `$${cliente.montoVenta?.toLocaleString('es-CO') || '0'}`,
      'Fecha Venta': cliente.fechaVenta ? new Date(cliente.fechaVenta).toLocaleDateString('es-CO') : '',
      'Estado': 'Vendido'
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Vendidos');
    XLSX.writeFile(workbook, `Clientes_Vendidos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <div className="admin-section">Cargando clientes...</div>;
  }

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Clientes Vendidos ({clientes.length})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchClientes()}
            style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FiRefreshCw size={14} /> Actualizar
          </button>
          {clientes.length > 0 && (
            <button 
              onClick={handleExportToExcel}
              style={{
                padding: '8px 14px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FiDownload size={14} /> Exportar
            </button>
          )}
        </div>
      </div>

      {clientes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          <p>No hay clientes vendidos</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="clientes-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{
                backgroundColor: '#1a1a2e',
                borderBottom: '2px solid #10b981'
              }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Teléfono</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Fecha Reunión</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Monto Venta</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} style={{
                  borderBottom: '1px solid #444',
                  backgroundColor: '#0f1419'
                }}>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: '600' }}>{cliente.nombre}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>{cliente.email}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{cliente.telefono}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>
                    {cliente.fecha} {cliente.hora}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>
                    ${cliente.montoVenta?.toLocaleString('es-CO') || '0'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(cliente.id, cliente.nombre)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '4px 8px'
                      }}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
