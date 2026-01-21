import React, { useState } from 'react';
import './AdminPanel.css';
import ClientsList from './ClientsList';
import SoldClientsList from './SoldClientsList';
import Estadisticas from './Estadisticas';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('potenciales');

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h2>Stivenads Admin</h2>
        <nav>
          <button
            className={activeTab === 'potenciales' ? 'active' : ''}
            onClick={() => setActiveTab('potenciales')}
          >
            Clientes Potenciales
          </button>
          <button
            className={activeTab === 'vendidos' ? 'active' : ''}
            onClick={() => setActiveTab('vendidos')}
          >
            Clientes
          </button>
          <button
            className={activeTab === 'estadisticas' ? 'active' : ''}
            onClick={() => setActiveTab('estadisticas')}
          >
            Estadísticas
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'potenciales' && <ClientsList />}
        {activeTab === 'vendidos' && <SoldClientsList />}
        {activeTab === 'estadisticas' && <Estadisticas />}
      </div>
    </div>
  );
}
