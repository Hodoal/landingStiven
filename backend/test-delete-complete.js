// Test completo de eliminación simulando exactamente lo que hace el frontend

const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Booking = require('./models/Booking');

async function testCompleteDelete() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/stivenads', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Conectado a MongoDB\n');

    // 1. Crear un lead de prueba
    console.log('1️⃣  CREANDO LEAD DE PRUEBA...');
    const testLead = new Lead({
      full_name: 'Test Usuario Eliminación',
      email: 'test-delete@example.com',
      phone: '3001234567',
      is_labor_lawyer: false,
      works_quota_litis: 'Sí',
      monthly_consultations: '0–10',
      willing_to_invest_ads: true,
      ads_budget_range: '100-500',
      main_problem: ['Test deletion'],
      lead_type: 'Ideal',
      status: 'scheduled',
      scheduled_date: new Date().toISOString(),
      scheduled_time: '10:00'
    });

    const createdLead = await testLead.save();
    console.log('✓ Lead creado con ID:', createdLead._id);
    console.log('  Email:', createdLead.email);
    console.log('  Nombre:', createdLead.full_name);

    // 2. Verificar que existe
    console.log('\n2️⃣  VERIFICANDO QUE EXISTE...');
    let foundLead = await Lead.findById(createdLead._id);
    console.log('✓ Lead encontrado:', foundLead ? 'SÍ' : 'NO');

    // 3. Buscar todos los leads
    console.log('\n3️⃣  CONTANDO LEADS ANTES DE ELIMINAR...');
    let leadsBefore = await Lead.find();
    console.log('✓ Leads en BD:', leadsBefore.length);

    // 4. ELIMINAR EL LEAD (simulando lo que hace el DELETE /:id)
    console.log('\n4️⃣  ELIMINANDO LEAD...');
    console.log('   Eliminando con ID:', createdLead._id);
    const deletedResult = await Lead.findByIdAndDelete(createdLead._id);
    console.log('✓ Resultado del delete:', deletedResult ? 'Eliminado' : 'No encontrado');

    // 5. Verificar que fue eliminado
    console.log('\n5️⃣  VERIFICANDO DESPUÉS DE ELIMINAR...');
    let foundAfter = await Lead.findById(createdLead._id);
    console.log('✓ Lead todavía existe:', foundAfter ? 'SÍ (ERROR!)' : 'NO (correcto)');

    // 6. Contar leads después
    console.log('\n6️⃣  CONTANDO LEADS DESPUÉS DE ELIMINAR...');
    let leadsAfter = await Lead.find();
    console.log('✓ Leads en BD:', leadsAfter.length);
    console.log('  Diferencia:', leadsBefore.length - leadsAfter.length, 'lead(s) eliminado(s)');

    // 7. Buscar por email (para verificar que desapareció)
    console.log('\n7️⃣  BUSCANDO POR EMAIL...');
    const byEmail = await Lead.findOne({ email: 'test-delete@example.com' });
    console.log('✓ Encontrado por email:', byEmail ? 'SÍ (ERROR!)' : 'NO (correcto)');

    // 8. Resultado final
    console.log('\n' + '='.repeat(50));
    if (!foundAfter && !byEmail && leadsAfter.length === leadsBefore.length - 1) {
      console.log('✅ PRUEBA EXITOSA: Eliminación funciona correctamente');
    } else {
      console.log('❌ PRUEBA FALLIDA: Algo salió mal');
      console.log('   - Aún existe por ID:', !!foundAfter);
      console.log('   - Aún existe por email:', !!byEmail);
      console.log('   - Diferencia de conteo:', leadsBefore.length - leadsAfter.length);
    }
    console.log('='.repeat(50));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Desconectado de MongoDB');
  }
}

testCompleteDelete();
