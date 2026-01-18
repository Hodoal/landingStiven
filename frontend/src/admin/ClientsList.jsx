import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiEdit3, FiCheck, FiX, FiDollarSign, FiDownload, FiRefreshCw, FiFilter, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './ClientsList.css';
import './ClientsListModals.css';

export default function ClientsList() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'agendado', 'en_proceso', 'confirmar'
  const [clienteToDelete, setClienteToDelete] = useState(null);

  // Calcular el estado basado en la hora actual vs hora agendada
  const getComputedStatus = (booking, date, time) => {
    if (booking.status === 'meeting-completed') return 'Reunión confirmada';
    if (booking.status === 'cancelled') return 'Reunión no realizada';
    if (booking.status === 'sold') return 'Cliente confirmado';
    
    // Comparar hora actual con hora agendada
    const now = new Date();
    const scheduledDateTime = new Date(`${date}T${time}`);
    const endTime = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000); // 1 hora de duración
    
    if (now >= scheduledDateTime && now < endTime) {
      return 'Reunión en proceso';
    } else if (now >= endTime) {
      return 'Confirmar reunión';
    } else if (booking.status === 'confirmed') {
      return 'Agendado';
    }
    return 'No Confirmado';
  };

  const getStatusColor = (estado) => {
    const colorMap = {
      'Agendado': { bg: '#d1fae5', text: '#065f46' },
      'Reunión en proceso': { bg: '#fef3c7', text: '#78350f' },
      'Confirmar reunión': { bg: '#fed7aa', text: '#92400e' },
      'Reunión confirmada': { bg: '#d1fae5', text: '#065f46' },
      'Reunión no realizada': { bg: '#fecaca', text: '#991b1b' },
      'Cliente confirmado': { bg: '#c7d2fe', text: '#3730a3' },
      'No Confirmado': { bg: '#fecaca', text: '#991b1b' }
    };
    return colorMap[estado] || { bg: '#e5e7eb', text: '#374151' };
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      // Fetch leads primero para filtrar solo los calificados (Ideal o Scale)
      const leadsResponse = await axios.get('/api/leads/admin/leads');
      const qualifiedLeads = leadsResponse.data.data
        .filter(lead => lead.lead_type === 'Ideal' || lead.lead_type === 'Scale')
        .filter(lead => lead.status !== 'disqualified' && lead.status !== 'sold');

      // Fetch bookings
      const bookingsResponse = await axios.get('/api/booking/list');
      const allBookings = bookingsResponse.data.success ? bookingsResponse.data.bookings : [];

      // Combinar leads con bookings, pero también mostrar leads sin booking si tienen scheduled_date
      const clientesData = [];

      // 1. Primero agregar leads que tienen booking
      const leadsWithBookings = new Set();
      allBookings.forEach(booking => {
        const correspondingLead = qualifiedLeads.find(l => l.email === booking.email);
        if (correspondingLead && booking.status !== 'sold') {
          leadsWithBookings.add(correspondingLead._id);
          const computedStatus = getComputedStatus(booking, booking.date, booking.time);
          clientesData.push({
            id: booking.id,
            nombre: booking.clientName || 'N/A',
            email: booking.email || 'N/A',
            telefono: booking.phone || 'N/A',
            fechaAgendamiento: booking.date || 'N/A',
            horaAgendamiento: booking.time || 'N/A',
            estado: computedStatus,
            status: booking.status,
            leadType: correspondingLead?.lead_type || 'N/A',
            leadInfo: correspondingLead,
            bookingInfo: booking
          });
        }
      });

      // 2. Luego agregar leads sin booking pero con fecha/hora agendada
      qualifiedLeads.forEach(lead => {
        if (!leadsWithBookings.has(lead._id) && lead.scheduled_date && lead.scheduled_time) {
          const computedStatus = getComputedStatus({ status: lead.status }, lead.scheduled_date, lead.scheduled_time);
          clientesData.push({
            id: lead._id,
            nombre: lead.full_name || 'N/A',
            email: lead.email || 'N/A',
            telefono: lead.phone || 'N/A',
            fechaAgendamiento: lead.scheduled_date || 'N/A',
            horaAgendamiento: lead.scheduled_time || 'N/A',
            estado: computedStatus,
            status: lead.status,
            leadType: lead.lead_type || 'N/A',
            leadInfo: lead,
            bookingInfo: null
          });
        }
      });
      
      setClientes(clientesData);
      aplicarFiltro(clientesData, filtro);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = (datos, tipoFiltro) => {
    let filtered = datos;
    if (tipoFiltro === 'agendado') {
      filtered = datos.filter(c => c.estado === 'Agendado');
    } else if (tipoFiltro === 'en_proceso') {
      filtered = datos.filter(c => c.estado === 'Reunión en proceso');
    } else if (tipoFiltro === 'confirmar') {
      filtered = datos.filter(c => c.estado === 'Confirmar reunión');
    }
    setClientesFiltrados(filtered);
  };

  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    aplicarFiltro(clientes, nuevoFiltro);
  };

  const handleExportToExcel = () => {
    const dataToExport = clientesFiltrados.map(cliente => ({
      'Nombre': cliente.nombre,
      'Email': cliente.email,
      'Teléfono': cliente.telefono,
      'Fecha Agendada': cliente.fechaAgendamiento,
      'Hora Agendada': cliente.horaAgendamiento,
      'Tipo': cliente.leadType,
      'Estado': cliente.estado
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Potenciales');
    XLSX.writeFile(workbook, `Clientes_Potenciales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleReschedule = (client) => {
    setSelectedClient(client);
    setRescheduleData({ date: client.fechaAgendamiento, time: client.horaAgendamiento });
    setShowRescheduleModal(true);
  };

  const handleConfirmMeeting = async (client, wasCompleted) => {
    try {
      const newStatus = wasCompleted ? 'meeting-completed' : 'cancelled';
      
      // Si tiene booking, actualizar el booking
      if (client.bookingInfo) {
        await axios.put(`/api/booking/${client.id}`, { status: newStatus });
      }
      
      // Siempre actualizar el lead también
      if (client.leadInfo?._id) {
        await axios.put(`/api/leads/update-status/${client.leadInfo._id}`, { status: newStatus });
      }
      
      fetchClientes();
    } catch (err) {
      console.error('Error updating meeting:', err);
      alert('Error al actualizar la reunión: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmReunionOccurred = async (client) => {
    // Este botón solo aparece cuando el estado es "Confirmar reunión"
    try {
      // Si tiene booking, actualizar el booking
      if (client.bookingInfo) {
        await axios.put(`/api/booking/${client.id}`, { status: 'meeting-completed' });
      }
      
      // Siempre actualizar el lead también
      if (client.leadInfo?._id) {
        await axios.put(`/api/leads/update-status/${client.leadInfo._id}`, { status: 'meeting-completed' });
      }
      
      fetchClientes();
      alert('Reunión confirmada como realizada');
    } catch (err) {
      console.error('Error confirming meeting:', err);
      alert('Error al confirmar la reunión: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePayment = async (client) => {
    setSelectedClient(client);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    try {
      // Si tiene booking, actualizar el booking
      if (selectedClient.bookingInfo) {
        await axios.put(`/api/booking/${selectedClient.id}`, {
          status: 'sold',
          venta_confirmada: true,
          monto_venta: parseFloat(paymentAmount)
        });
      }

      // Actualizar el lead como vendido
      if (selectedClient.leadInfo?._id) {
        await axios.put(`/api/leads/mark-as-sold/${selectedClient.leadInfo._id}`, {
          sale_amount: parseFloat(paymentAmount)
        });
      }

      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchClientes();
      alert('Pago registrado y cliente movido a clientes confirmados');
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Error al procesar el pago: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteClient = async () => {
    if (!clienteToDelete) return;

    try {
      // Eliminar el booking si existe
      if (clienteToDelete.bookingInfo) {
        await axios.delete(`/api/booking/${clienteToDelete.id}`);
      }

      // Eliminar el lead
      if (clienteToDelete.leadInfo?._id) {
        await axios.delete(`/api/leads/${clienteToDelete.leadInfo._id}`);
      }

      setShowDeleteModal(false);
      setClienteToDelete(null);
      fetchClientes();
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar el cliente: ' + (err.response?.data?.message || err.message));
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Selecciona fecha y hora');
      return;
    }

    try {
      // Si tiene booking, actualizar el booking
      if (selectedClient.bookingInfo) {
        // Eliminar el evento anterior de Google Calendar si existe
        if (selectedClient.bookingInfo.googleCalendarEventId) {
          await axios.delete(`/api/calendar/${selectedClient.bookingInfo.googleCalendarEventId}`);
        }

        // Actualizar el booking con nuevos datos
        await axios.put(`/api/booking/${selectedClient.id}`, {
          date: rescheduleData.date,
          time: rescheduleData.time
        });
      } else if (selectedClient.leadInfo) {
        // Si no tiene booking pero tiene lead, actualizar el lead
        await axios.put(`/api/leads/update-schedule/${selectedClient.id}`, {
          scheduled_date: rescheduleData.date,
          scheduled_time: rescheduleData.time
        });
      }

      setShowRescheduleModal(false);
      fetchClientes();
      alert('Reunión reprogramada exitosamente');
    } catch (err) {
      console.error('Error rescheduling:', err);
      alert('Error al reprogramar la reunión: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Cargando...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>{error}</p>;

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Clientes Potenciales Calificados ({clientesFiltrados.length})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchClientes()}
            style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FiRefreshCw size={14} /> Actualizar
          </button>
          {clientesFiltrados.length > 0 && (
            <button
              onClick={handleExportToExcel}
              style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FiDownload size={14} /> Exportar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => handleFiltroChange('todos')} style={{ padding: '6px 12px', backgroundColor: filtro === 'todos' ? '#fbbf24' : '#444', color: filtro === 'todos' ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          <FiFilter size={12} style={{ display: 'inline', marginRight: '4px' }} /> Todos ({clientes.length})
        </button>
        <button onClick={() => handleFiltroChange('agendado')} style={{ padding: '6px 12px', backgroundColor: filtro === 'agendado' ? '#fbbf24' : '#444', color: filtro === 'agendado' ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          Agendado ({clientes.filter(c => c.estado === 'Agendado').length})
        </button>
        <button onClick={() => handleFiltroChange('en_proceso')} style={{ padding: '6px 12px', backgroundColor: filtro === 'en_proceso' ? '#fbbf24' : '#444', color: filtro === 'en_proceso' ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          En Proceso ({clientes.filter(c => c.estado === 'Reunión en proceso').length})
        </button>
        <button onClick={() => handleFiltroChange('confirmar')} style={{ padding: '6px 12px', backgroundColor: filtro === 'confirmar' ? '#fbbf24' : '#444', color: filtro === 'confirmar' ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
          Confirmar ({clientes.filter(c => c.estado === 'Confirmar reunión').length})
        </button>
      </div>

      {clientesFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay clientes registrados</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Fecha Agendamiento</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.fechaAgendamiento}</td>
                  <td>{c.horaAgendamiento}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: c.leadType === 'Ideal' ? '#dbeafe' : '#fef3c7',
                      color: c.leadType === 'Ideal' ? '#0c4a6e' : '#78350f'
                    }}>
                      {c.leadType}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(c.estado).bg,
                      color: getStatusColor(c.estado).text
                    }}>
                      {c.estado}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn"
                        title="Ver información"
                        onClick={() => handleViewClient(c)}
                      >
                        <FiEye size={18} />
                      </button>
                      
                      {c.estado !== 'Reunión confirmada' && c.estado !== 'Cliente confirmado' && (
                        <>
                          <button
                            className="action-btn"
                            title="Reagendar"
                            onClick={() => handleReschedule(c)}
                          >
                            <FiEdit3 size={18} />
                          </button>
                          
                          {c.estado !== 'Reunión no realizada' && (
                            <>
                              <button
                                className="action-btn"
                                title={c.estado === 'Confirmar reunión' ? 'Confirmar reunión realizada' : 'Marcar como completada'}
                                onClick={() => {
                                  if (c.estado === 'Confirmar reunión') {
                                    handleConfirmReunionOccurred(c);
                                  } else {
                                    handleConfirmMeeting(c, true);
                                  }
                                }}
                              >
                                <FiCheck size={18} />
                              </button>
                              
                              <button
                                className="action-btn"
                                title="Marcar como no realizada"
                                onClick={() => handleConfirmMeeting(c, false)}
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      
                      {(c.estado === 'Reunión confirmada' || c.estado === 'Confirmar reunión') && (
                        <button
                          className="action-btn"
                          title="Registrar pago"
                          onClick={() => handlePayment(c)}
                        >
                          <FiDollarSign size={18} />
                        </button>
                      )}

                      <button
                        className="action-btn delete-btn"
                        title="Eliminar cliente"
                        onClick={() => {
                          setClienteToDelete(c);
                          setShowDeleteModal(true);
                        }}
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
      )}

      {/* Modal Ver Información */}
      {showViewModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Información del Cliente</h3>
            <div className="modal-info">
              <p><strong>Nombre:</strong> {selectedClient.nombre}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Teléfono:</strong> {selectedClient.telefono}</p>
              <p><strong>Tipo de Lead:</strong> {selectedClient.leadType}</p>
              <p><strong>Fecha Agendada:</strong> {selectedClient.fechaAgendamiento}</p>
              <p><strong>Hora Agendada:</strong> {selectedClient.horaAgendamiento}</p>
              
              {selectedClient.leadInfo && (
                <>
                  <h4>Respuestas a Preguntas:</h4>
                  <p><strong>Es abogado laboral:</strong> {selectedClient.leadInfo.is_labor_lawyer ? 'Sí' : 'No'}</p>
                  <p><strong>Consultas mensuales:</strong> {selectedClient.leadInfo.monthly_consultations}</p>
                  <p><strong>Trabaja con cuota litis:</strong> {selectedClient.leadInfo.works_quota_litis || 'N/A'}</p>
                  <p><strong>Presupuesto en ads:</strong> {selectedClient.leadInfo.ads_budget_range || 'N/A'}</p>
                  <p><strong>Dispuesto a invertir en ads:</strong> {selectedClient.leadInfo.willing_to_invest_ads ? 'Sí' : 'No'}</p>
                  <p><strong>Problemas principales:</strong> {selectedClient.leadInfo.main_problem?.join(', ') || 'N/A'}</p>
                </>
              )}
            </div>
            <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal Reagendar */}
      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reagendar Reunión</h3>
            <div className="modal-form">
              <label>Nueva Fecha:</label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
              <label>Nueva Hora:</label>
              <input
                type="time"
                value={rescheduleData.time}
                onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              />
              <div className="modal-buttons">
                <button className="btn-confirm" onClick={submitReschedule}>Confirmar</button>
                <button className="btn-cancel" onClick={() => setShowRescheduleModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pago */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Registrar Pago</h3>
            <div className="modal-form">
              <label>Monto ($):</label>
              <input
                type="number"
                placeholder="Ingresa el monto"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="modal-buttons">
                <button className="btn-confirm" onClick={submitPayment}>Registrar</button>
                <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Cliente */}
      {showDeleteModal && clienteToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Eliminar Cliente</h3>
            <div className="modal-form">
              <p style={{ color: '#ef4444', fontWeight: '600', marginBottom: '15px' }}>
                ⚠️ ¿Está seguro de que desea eliminar a <strong>{clienteToDelete.nombre}</strong>?
              </p>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
                Esta acción no se puede deshacer y eliminará todos los registros asociados (leads y bookings).
              </p>
              <div className="modal-buttons">
                <button className="btn-confirm" style={{ backgroundColor: '#ef4444' }} onClick={handleDeleteClient}>
                  Eliminar
                </button>
                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
