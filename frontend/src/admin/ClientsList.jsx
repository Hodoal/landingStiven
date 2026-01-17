import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientsList.css';

export default function ClientsList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/booking/list');
      
      if (response.data.success && response.data.bookings) {
        const potentialClients = response.data.bookings.filter(b => b.status !== 'sold');
        
        const clientesData = potentialClients.map((booking) => ({
          id: booking.id,
          nombre: booking.clientName || 'N/A',
          email: booking.email || 'N/A',
          telefono: booking.phone || 'N/A',
          empresa: booking.company || 'N/A',
          fechaAgendamiento: booking.date || 'N/A',
          horaAgendamiento: booking.time || 'N/A',
          estado: booking.status === 'No Confirmado' ? 'No Confirmado' : 'Confirmado',
          status: booking.status
        }));
        
        setClientes(clientesData);
        setError(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Cargando...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>{error}</p>;

  return (
    <div className="admin-section">
      <h2>Clientes Potenciales ({clientes.length})</h2>
      {clientes.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay clientes registrados</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Empresa</th>
                <th>Fecha Agendamiento</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.empresa}</td>
                  <td>{c.fechaAgendamiento}</td>
                  <td>{c.horaAgendamiento}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: c.estado === 'No Confirmado' ? '#fecaca' : '#d1fae5',
                      color: c.estado === 'No Confirmado' ? '#991b1b' : '#065f46'
                    }}>
                      {c.estado}
                    </span>
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
