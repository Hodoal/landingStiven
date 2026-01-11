import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiTrash2, FiDownload, FiEdit2, FiCalendar, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function ClientsList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleError, setSaleError] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('¿Cambiar este cliente a "No Confirmado"?')) {
      try {
        console.log(`Cancelling booking with ID: ${id}`);
        const response = await axios.put(`/api/booking/${id}/cancel`);
        if (response.data.success) {
          fetchClientes();
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Error al cancelar el agendamiento: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este cliente permanentemente? Esta acción no se puede deshacer.')) {
      try {
        console.log(`Deleting booking with ID: ${id}`);
        const response = await axios.delete(`/api/booking/${id}`);
        if (response.data.success) {
          fetchClientes();
        }
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Error al eliminar el cliente: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleExportToExcel = () => {
    if (clientes.length === 0) {
      alert('No hay clientes para exportar');
      return;
    }

    // Preparar datos para Excel
    const dataToExport = clientes.map((cliente, index) => ({
      'Nº': index + 1,
      'Nombre': cliente.nombre,
      'Email': cliente.email,
      'Teléfono': cliente.telefono,
      'Empresa': cliente.empresa,
      'Fecha': cliente.fechaAgendamiento,
      'Hora': cliente.horaAgendamiento,
      'Estado': cliente.estado
    }));

    // Crear workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 5 },   // Nº
      { wch: 20 },  // Nombre
      { wch: 25 },  // Email
      { wch: 18 },  // Teléfono
      { wch: 20 },  // Empresa
      { wch: 15 },  // Fecha
      { wch: 10 },  // Hora
      { wch: 15 }   // Estado
    ];
    ws['!cols'] = colWidths;

    // Descargar archivo
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Clientes_Stivenads_${timestamp}.xlsx`);
  };

  const handleReschedule = (cliente) => {
    setSelectedCliente(cliente);
    setNewDate(cliente.fechaAgendamiento);
    setNewTime(cliente.horaAgendamiento);
    setRescheduleError('');
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = async () => {
    if (!newDate || !newTime) {
      setRescheduleError('Por favor completa la fecha y hora');
      return;
    }

    try {
      const response = await axios.put(`/api/booking/${selectedCliente.id}/reschedule`, {
        date: newDate,
        time: newTime
      });

      if (response.data.success) {
        setShowRescheduleModal(false);
        setRescheduleError('');
        fetchClientes();
        alert('Reunión reprogramada exitosamente');
      }
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setRescheduleError(errorMessage);
    }
  };

  const handleSaleClick = (cliente) => {
    setSelectedCliente(cliente);
    setSaleAmount('');
    setSaleError('');
    setShowSaleModal(true);
  };

  const handleConfirmSale = async () => {
    if (!saleAmount || parseFloat(saleAmount) <= 0) {
      setSaleError('Por favor ingresa un monto válido');
      return;
    }

    try {
      const response = await axios.put(`/api/booking/${selectedCliente.id}/confirm-sale`, {
        monto_venta: parseFloat(saleAmount)
      });

      if (response.data.success) {
        setShowSaleModal(false);
        setSaleError('');
        fetchClientes();
        alert('Venta registrada exitosamente');
      }
    } catch (err) {
      console.error('Error confirming sale:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setSaleError(errorMessage);
    }
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/booking/list');
      
      if (response.data.success && response.data.bookings) {
        // Filter only potential clients (not sold)
        const potentialClients = response.data.bookings.filter(b => b.status !== 'sold');
        
        // Transform booking data to match table format
        const clientesData = potentialClients.map((booking) => ({
          id: booking.id || booking.confirmationToken,
          nombre: booking.clientName || booking.nombre || 'N/A',
          email: booking.email || 'N/A',
          telefono: booking.phone || booking.telefono || 'N/A',
          empresa: booking.company || booking.empresa || 'N/A',
          fechaAgendamiento: booking.date || 'N/A',
          horaAgendamiento: booking.time || 'N/A',
          estado: booking.status === 'No Confirmado' ? 'No Confirmado' : 
                  booking.status === 'meeting-completed' ? 'Reunión finalizada, en espera de confirmación' :
                  'Confirmado',
          status: booking.status
        }));
        
        setClientes(clientesData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error al cargar clientes. Intenta de nuevo.');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Cargando clientes...</p>;

  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>{error}</p>;

  if (clientes.length === 0) {
    return (
      <div className="admin-section">
        <h2>Clientes</h2>
        <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay clientes registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clientes ({clientes.length})</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleExportToExcel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            <FiDownload size={18} />
            Exportar Excel
          </button>
          <button 
            onClick={fetchClientes}
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
      </div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="clients-table" style={{ minWidth: '1300px', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Nombre</th>
              <th style={{ width: '18%' }}>Email</th>
              <th style={{ width: '12%' }}>Teléfono</th>
              <th style={{ width: '15%' }}>Empresa</th>
              <th style={{ width: '12%' }}>Fecha</th>
              <th style={{ width: '10%' }}>Hora</th>
              <th style={{ width: '12%' }}>Estado</th>
              <th style={{ width: '6%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td style={{ width: '15%', padding: '12px' }}>{cliente.nombre}</td>
                <td style={{ width: '18%', padding: '12px', fontSize: '13px' }}>{cliente.email}</td>
                <td style={{ width: '12%', padding: '12px' }}>{cliente.telefono}</td>
                <td style={{ width: '15%', padding: '12px' }}>{cliente.empresa}</td>
                <td style={{ width: '12%', padding: '12px' }}>{cliente.fechaAgendamiento}</td>
                <td style={{ width: '10%', padding: '12px' }}>{cliente.horaAgendamiento}</td>
                <td style={{ width: '12%', padding: '12px' }}>
                  <span 
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      backgroundColor: cliente.estado === 'No Confirmado' ? '#fecaca' : '#d1fae5',
                      color: cliente.estado === 'No Confirmado' ? '#991b1b' : '#065f46'
                    }}
                  >
                    {cliente.estado}
                  </span>
                </td>
                <td style={{ width: '6%', padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => handleReschedule(cliente)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#3b82f6',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                      onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                      title="Cambiar fecha"
                    >
                      <FiCalendar size={18} />
                    </button>
                    <button
                      onClick={() => handleSaleClick(cliente)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#22c55e',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#4ade80'}
                      onMouseLeave={(e) => e.target.style.color = '#22c55e'}
                      title="Registrar venta"
                    >
                      <FiDollarSign size={18} />
                    </button>
                    <button
                      onClick={() => handleCancel(cliente.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#f59e0b',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                      onMouseLeave={(e) => e.target.style.color = '#f59e0b'}
                      title="Cancelar agendamiento"
                    >
                      <FiX size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#ef4444',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#f87171'}
                      onMouseLeave={(e) => e.target.style.color = '#ef4444'}
                      title="Eliminar permanentemente"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Reprogramación */}
      {showRescheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid #374151'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>
              Reprogramar Reunión
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '5px' }}>
              <strong>Cliente:</strong> {selectedCliente?.nombre}
            </p>
            <p style={{ color: '#d1d5db', marginBottom: '20px' }}>
              <strong>Fecha actual:</strong> {selectedCliente?.fechaAgendamiento} a las {selectedCliente?.horaAgendamiento}
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontWeight: '600' }}>
                Nueva Fecha
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontWeight: '600' }}>
                Nueva Hora
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {rescheduleError && (
              <div style={{
                marginBottom: '15px',
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                {rescheduleError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveReschedule}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                Guardar
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Venta */}
      {showSaleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid #374151'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>
              Registrar Venta
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '5px' }}>
              <strong>Cliente:</strong> {selectedCliente?.nombre}
            </p>
            <p style={{ color: '#d1d5db', marginBottom: '20px' }}>
              <strong>Asesoría:</strong> {selectedCliente?.fechaAgendamiento} a las {selectedCliente?.horaAgendamiento}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontWeight: '600' }}>
                Monto de la Venta (COP)
              </label>
              <input
                type="number"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                placeholder="Ej: 500000"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {saleError && (
              <div style={{
                marginBottom: '15px',
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                {saleError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirmSale}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
              >
                Confirmar Venta
              </button>
              <button
                onClick={() => setShowSaleModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
