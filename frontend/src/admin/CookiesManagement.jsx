import React, { useState, useEffect } from 'react';

export default function CookiesManagement() {
  const [cookiesData, setCookiesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí irá la llamada a tu backend para obtener datos de cookies aceptadas
    setCookiesData([
      {
        id: 1,
        cliente: 'Juan Pérez',
        email: 'juan@example.com',
        cookiesAceptadas: true,
        fechaAceptacion: '2024-01-15',
        marketingConsentido: true
      },
      {
        id: 2,
        cliente: 'María García',
        email: 'maria@example.com',
        cookiesAceptadas: true,
        fechaAceptacion: '2024-01-20',
        marketingConsentido: false
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="admin-section">
      <h2>Gestión de Cookies y Consentimiento</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Email</th>
            <th>Cookies Aceptadas</th>
            <th>Fecha de Aceptación</th>
            <th>Consentimiento para Marketing</th>
          </tr>
        </thead>
        <tbody>
          {cookiesData.map(data => (
            <tr key={data.id}>
              <td>{data.cliente}</td>
              <td>{data.email}</td>
              <td>
                <span className={data.cookiesAceptadas ? 'badge confirmado' : 'badge rechazado'}>
                  {data.cookiesAceptadas ? 'Sí' : 'No'}
                </span>
              </td>
              <td>{data.fechaAceptacion}</td>
              <td>
                <span className={data.marketingConsentido ? 'badge confirmado' : 'badge rechazado'}>
                  {data.marketingConsentido ? 'Sí' : 'No'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
