import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiDownload, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './ClientsList.css';
import './ClientsListModals.css';

export default function DisqualifiedClientsList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      console.log('📤 Fetching from:', `${API_BASE_URL}/leads/admin/leads`);
      
      // Fetch all leads and filter for those with status 'No califica'
      const leadsResponse = await axios.get(`${API_BASE_URL}/leads/admin/leads`);
      
      console.log('✅ Response:', leadsResponse.data);
      
      const allLeads = leadsResponse.data.data || [];
      console.log('📊 Total leads received:', allLeads.length);
      
      const disqualifiedLeads = allLeads
        .filter(lead => lead.status === 'No califica')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('🔍 Disqualified leads found:', disqualifiedLeads.length);
      disqualifiedLeads.forEach((lead, i) => {
        console.log(`  ${i+1}. ${lead.email} - ${lead.status} - ${lead.disqualified_reason}`);
      });

      setClientes(disqualifiedLeads);
    } catch (err) {
      console.error('❌ Error fetching disqualified clients:', err);
      console.error('   Message:', err.message);
      console.error('   Response:', err.response?.data);
      console.error('   Status:', err.response?.status);
      setError(`Error al cargar los clientes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_BASE_URL}/leads/${clientId}`);
      
      setClientes(clientes.filter(c => c._id !== clientId));
      setShowDeleteModal(false);
      setClienteToDelete(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar el cliente');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clientes.map(c => ({
      'Nombre Completo': c.full_name,
      'Email': c.email,
      'Teléfono': c.phone,
      'Consultas Mensuales': c.monthly_consultations,
      'Abogado Laboral': c.is_labor_lawyer ? 'Sí' : 'No',
      'Razón de No Calificación': c.disqualified_reason || 'N/A',
      'Fecha': new Date(c.createdAt).toLocaleDateString('es-ES'),
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'No Califican');
    XLSX.writeFile(workbook, `clientes-no-califican-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <div className="loading">⏳ Cargando clientes...</div>;
  }

  if (error) {
    return (
      <div className="clients-list-container">
        <div className="clients-header">
          <div>
            <h2>Clientes que No Califican</h2>
          </div>
        </div>
        <div className="error-section" style={{
          padding: '20px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <h3>❌ Error de Conexión</h3>
          <p>{error}</p>
          <p><strong>Asegúrate de que:</strong></p>
          <ul>
            <li>El servidor backend está corriendo (npm start)</li>
            <li>La URL de la API es correcta: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</li>
            <li>El puerto 5000 está disponible</li>
          </ul>
          <button 
            className="btn-action refresh" 
            onClick={fetchClientes}
            style={{ marginTop: '10px' }}
          >
            <FiRefreshCw /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-list-container">
      <div className="clients-header">
        <div>
          <h2>Clientes que No Califican</h2>
          <p className="subtitle">Total: {clientes.length} clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-action refresh" onClick={fetchClientes} title="Actualizar">
            <FiRefreshCw /> Actualizar
          </button>
          <button className="btn-action export" onClick={exportToExcel} title="Descargar">
            <FiDownload /> Descargar Excel
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Consultas Mensuales</th>
              <th>Razón No Califica</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No hay clientes que no califiquen
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente._id}>
                  <td>{cliente.full_name}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.phone}</td>
                  <td>{cliente.monthly_consultations}</td>
                  <td>{cliente.disqualified_reason || 'No especificada'}</td>
                  <td>{new Date(cliente.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-action view"
                      onClick={() => {
                        setSelectedClient(cliente);
                        setShowViewModal(true);
                      }}
                      title="Ver detalles"
                    >
                      <FiEye />
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => {
                        setClienteToDelete(cliente);
                        setShowDeleteModal(true);
                      }}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Detalles del Cliente</h3>
            <div className="modal-body">
              <div className="field">
                <label>Nombre:</label>
                <p>{selectedClient.full_name}</p>
              </div>
              <div className="field">
                <label>Email:</label>
                <p>{selectedClient.email}</p>
              </div>
              <div className="field">
                <label>Teléfono:</label>
                <p>{selectedClient.phone}</p>
              </div>
              <div className="field">
                <label>Consultas Mensuales:</label>
                <p>{selectedClient.monthly_consultations}</p>
              </div>
              <div className="field">
                <label>Abogado Laboral:</label>
                <p>{selectedClient.is_labor_lawyer ? 'Sí' : 'No'}</p>
              </div>
              <div className="field">
                <label>Razón de No Calificación:</label>
                <p>{selectedClient.disqualified_reason || 'No especificada'}</p>
              </div>
              <div className="field">
                <label>Fecha de Aplicación:</label>
                <p>{new Date(selectedClient.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
              {selectedClient.main_problem && selectedClient.main_problem.length > 0 && (
                <div className="field">
                  <label>Problemas Principales:</label>
                  <p>{selectedClient.main_problem.join(', ')}</p>
                </div>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowViewModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clienteToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content confirm" onClick={e => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar a {clienteToDelete.full_name}?</p>
            <p className="warning">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteClient(clienteToDelete._id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
