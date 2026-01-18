import React, { useState } from 'react';
import axios from 'axios';
import GoogleCalendarScheduler from './GoogleCalendarScheduler';
import SuccessPage from './SuccessPage';
import DisqualifiedPage from './DisqualifiedPage';
import './ApplicationForm.css';

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthly_consultations: '',
    is_labor_lawyer: null,
    works_quota_litis: '',
    ads_budget_range: '',
    willing_to_invest_ads: null,
    main_problem: [],
    full_name: '',
    email: '',
    phone: '',
    scheduled_date: '',
    scheduled_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disqualified, setDisqualified] = useState(false);

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProblemToggle = (problem) => {
    const current = formData.main_problem || [];
    const updated = current.includes(problem)
      ? current.filter(p => p !== problem)
      : [...current, problem];
    setFormData({ ...formData, main_problem: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await axios.post(`${API_BASE_URL}/leads/submit-application`, {
        monthly_consultations: formData.monthly_consultations,
        is_labor_lawyer: formData.is_labor_lawyer,
        works_quota_litis: formData.works_quota_litis,
        ads_budget_range: formData.ads_budget_range,
        willing_to_invest_ads: formData.willing_to_invest_ads,
        main_problem: formData.main_problem,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time
      });

      if (response.data.disqualified) {
        setDisqualified(true);
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      alert('Error al enviar formulario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (disqualified) {
    return <DisqualifiedPage onClose={() => window.location.href = '/'} />;
  }

  if (submitted) {
    return <SuccessPage />;
  }

  return (
    <div className="application-form-container">
      <div className="form-wrapper">
        {/* Step 1: Consultas mensuales */}
        {step === 1 && (
          <div className="form-step">
            <h2>¿Cuántas consultas atiendes al mes?</h2>
            <div className="options">
              {['0–10', '10–30', '30–60', '60+'].map(option => (
                <button
                  key={option}
                  className={`option-btn ${formData.monthly_consultations === option ? 'active' : ''}`}
                  onClick={() => handleInputChange('monthly_consultations', option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button onClick={handleNext} className="btn-next">Siguiente</button>
          </div>
        )}

        {/* Step 2: ¿Eres abogado laboral? */}
        {step === 2 && (
          <div className="form-step">
            <h2>¿Eres abogado laboral?</h2>
            <div className="yes-no-buttons">
              <button
                className={`yes-no-btn ${formData.is_labor_lawyer === true ? 'active' : ''}`}
                onClick={() => handleInputChange('is_labor_lawyer', true)}
              >
                Sí
              </button>
              <button
                className={`yes-no-btn ${formData.is_labor_lawyer === false ? 'active' : ''}`}
                onClick={() => handleInputChange('is_labor_lawyer', false)}
              >
                No
              </button>
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button onClick={handleNext} className="btn-next">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 3: Cuota de litis */}
        {step === 3 && (
          <div className="form-step">
            <h2>¿Trabajas con cuota de litis?</h2>
            <div className="options">
              {['Sí', 'No', 'A veces'].map(option => (
                <button
                  key={option}
                  className={`option-btn ${formData.works_quota_litis === option ? 'active' : ''}`}
                  onClick={() => handleInputChange('works_quota_litis', option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button onClick={handleNext} className="btn-next">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 4: Presupuesto ADS */}
        {step === 4 && (
          <div className="form-step">
            <h2>¿Cuál es tu presupuesto de ADS?</h2>
            <div className="options">
              {['0-500000', '500000-1000000', '1000000-5000000', '5000000+'].map(option => (
                <button
                  key={option}
                  className={`option-btn ${formData.ads_budget_range === option ? 'active' : ''}`}
                  onClick={() => handleInputChange('ads_budget_range', option)}
                >
                  ${option}
                </button>
              ))}
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button onClick={handleNext} className="btn-next">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 5: Dispuesto a invertir */}
        {step === 5 && (
          <div className="form-step">
            <h2>¿Estás dispuesto a invertir en ADS?</h2>
            <div className="yes-no-buttons">
              <button
                className={`yes-no-btn ${formData.willing_to_invest_ads === true ? 'active' : ''}`}
                onClick={() => handleInputChange('willing_to_invest_ads', true)}
              >
                Sí
              </button>
              <button
                className={`yes-no-btn ${formData.willing_to_invest_ads === false ? 'active' : ''}`}
                onClick={() => handleInputChange('willing_to_invest_ads', false)}
              >
                No
              </button>
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button onClick={handleNext} className="btn-next">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 6: Problemas principales */}
        {step === 6 && (
          <div className="form-step">
            <h2>¿Cuáles son tus principales problemas?</h2>
            <div className="checkboxes">
              {[
                'Falta de clientes',
                'Falta de tiempo',
                'Procesos ineficientes',
                'Competencia fuerte',
                'No sé por dónde empezar'
              ].map(problem => (
                <label key={problem} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.main_problem.includes(problem)}
                    onChange={() => handleProblemToggle(problem)}
                  />
                  {problem}
                </label>
              ))}
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button onClick={handleNext} className="btn-next">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 7: Información de contacto */}
        {step === 7 && (
          <div className="form-step">
            <h2>Tu información de contacto</h2>
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input-field"
            />

            {/* Mostrar calendario solo si califica */}
            {formData.monthly_consultations !== '0–10' && (
              <GoogleCalendarScheduler
                onDateChange={(date) => handleInputChange('scheduled_date', date)}
                onTimeChange={(time) => handleInputChange('scheduled_time', time)}
              />
            )}

            <div className="nav-buttons">
              <button onClick={handlePrev} className="btn-prev">Anterior</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="progress-bar">
        <div className="progress" style={{ width: `${(step / 7) * 100}%` }}></div>
      </div>
    </div>
  );
}
