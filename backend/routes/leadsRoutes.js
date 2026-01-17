const express = require('express');
const Lead = require('../models/Lead');
const router = express.Router();

// Clasificar lead basado en consultas mensuales
const classifyLead = (monthlyConsultations) => {
  if (monthlyConsultations === '10–30' || monthlyConsultations === '30–60') {
    return 'Ideal';
  } else if (monthlyConsultations === '60+') {
    return 'Scale';
  }
  return null; // Sin clasificar (no califica)
};

// POST: Enviar aplicación
router.post('/submit-application', async (req, res) => {
  try {
    const { full_name, email, phone, monthly_consultations, scheduled_date, scheduled_time, ...otherData } = req.body;

    // Clasificar el lead
    const lead_type = classifyLead(monthly_consultations);
    
    // Determinar si califica
    const isDisqualified = lead_type === null;
    const status = isDisqualified ? 'disqualified' : 'applied';

    const newLead = new Lead({
      full_name,
      email,
      phone,
      monthly_consultations,
      lead_type,
      status,
      scheduled_date,
      scheduled_time,
      disqualified_reason: isDisqualified ? 'Menos de 10 consultas mensuales' : null,
      disqualified_at: isDisqualified ? new Date() : null,
      ...otherData
    });

    const savedLead = await newLead.save();

    res.json({
      success: true,
      data: savedLead,
      disqualified: isDisqualified
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Obtener todos los leads para admin
router.get('/admin/leads', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Estadísticas
router.get('/admin/stats', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const soldLeads = await Lead.countDocuments({ status: 'sold' });
    const appliedLeads = await Lead.countDocuments({ status: 'applied' });
    const disqualifiedLeads = await Lead.countDocuments({ status: 'disqualified' });

    // Calcular ingresos
    const sales = await Lead.find({ status: 'sold' });
    const totalIncome = sales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);
    const averageIncome = soldLeads > 0 ? totalIncome / soldLeads : 0;

    // Ingresos este mes
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = await Lead.find({
      status: 'sold',
      sold_at: { $gte: monthStart }
    });
    const incomeThisMonth = monthSales.reduce((sum, lead) => sum + (lead.sale_amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        soldLeads,
        appliedLeads,
        disqualifiedLeads,
        totalIncome,
        averageIncome,
        incomeThisMonth,
        soldThisMonth: monthSales.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT: Actualizar estado del lead
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT: Marcar como vendido
router.put('/mark-as-sold/:id', async (req, res) => {
  try {
    const { sale_amount } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sold',
        sale_amount,
        sold_at: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE: Eliminar lead
router.delete('/:id', async (req, res) => {
  try {
    const result = await Lead.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Lead eliminado'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
