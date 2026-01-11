import React, { useState, useEffect } from 'react';
import { FiX, FiTrash2, FiDownload } from 'react-icons/fi';
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
      const response = await fetch('http://localhost:3001/api/booking/list');
      const data = await response.json();
      
      if (data.success) {
        // Filter only sold clients
        const vendidos = data.bookings.filter(b => b.status === 'sold');
        setClientes(vendidos);
        setError(null);
      } else {
        setError('Error al cargar clientes');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
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
      'Nombre': cliente.clientName,
      'Email': cliente.email,
      'Teléfono': cliente.phone,
      'Empresa': cliente.company,
      'Fecha': cliente.date,
      'Hora': cliente.time,
      'Monto Venta': `$${cliente.monto_venta?.toLocaleString('es-CO') || '0'}`,
      'Fecha Venta': cliente.fecha_venta ? new Date(cliente.fecha_venta).toLocaleDateString('es-CO') : '',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clientes Vendidos ({clientes.length})</h2>
        {clientes.length > 0 && (
          <button 
            onClick={handleExportToExcel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <FiDownload size={16} /> Exportar Excel
          </button>
        )}
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
                <th style={{ textAlign: 'left', padding: '12px' }}>Empresa</th>
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
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: '600' }}>{cliente.clientName}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>{cliente.email}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{cliente.phone}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{cliente.company}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>
                    {cliente.date} {cliente.time}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>
                    ${cliente.monto_venta?.toLocaleString('es-CO') || '0'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(cliente.id, cliente.clientName)}
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
