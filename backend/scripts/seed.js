const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/stivenads-local';

const leadSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  full_name: String,
  phone: String,
  is_labor_lawyer: Boolean,
  monthly_consultations: String,
  willing_to_invest: Boolean,
  ads_budget: String,
  lead_type: String,
  status: String,
  disqualified_reason: String,
  sale_amount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

async function cleanAndSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    await Lead.deleteMany({});
    console.log('🗑️  Base de datos limpiada');

    const testLeads = [
      // 3 No califican
      { email: 'nocal1@test.com', full_name: 'No Califica Uno', phone: '+573001111111', status: 'No califica', disqualified_reason: 'No es abogado laboralista' },
      { email: 'nocal2@test.com', full_name: 'No Califica Dos', phone: '+573002222222', status: 'No califica', disqualified_reason: 'Consultas mensuales muy bajas (0-10)' },
      { email: 'nocal3@test.com', full_name: 'No Califica Tres', phone: '+573003333333', status: 'No califica', disqualified_reason: 'No dispuesto a invertir en publicidad' },
      
      // 6 Calificados (3 Ideal + 3 Scale)
      { email: 'ideal1@test.com', full_name: 'Cliente Ideal Uno', phone: '+573004444444', lead_type: 'Ideal', status: 'applied' },
      { email: 'ideal2@test.com', full_name: 'Cliente Ideal Dos', phone: '+573005555555', lead_type: 'Ideal', status: 'scheduled' },
      { email: 'ideal3@test.com', full_name: 'Cliente Ideal Tres', phone: '+573006666666', lead_type: 'Ideal', status: 'applied' },
      { email: 'scale1@test.com', full_name: 'Cliente Scale Uno', phone: '+573007777777', lead_type: 'Scale', status: 'applied' },
      { email: 'scale2@test.com', full_name: 'Cliente Scale Dos', phone: '+573008888888', lead_type: 'Scale', status: 'scheduled' },
      { email: 'scale3@test.com', full_name: 'Cliente Scale Tres', phone: '+573009999999', lead_type: 'Scale', status: 'applied' },
      
      // 3 Vendidos
      { email: 'sold1@test.com', full_name: 'Cliente Vendido Uno', phone: '+573101111111', lead_type: 'Ideal', status: 'sold', sale_amount: 5000000 },
      { email: 'sold2@test.com', full_name: 'Cliente Vendido Dos', phone: '+573102222222', lead_type: 'Ideal', status: 'sold', sale_amount: 3500000 },
      { email: 'sold3@test.com', full_name: 'Cliente Vendido Tres', phone: '+573103333333', lead_type: 'Scale', status: 'sold', sale_amount: 2000000 }
    ];

    await Lead.insertMany(testLeads);
    console.log('✅ 12 clientes de prueba insertados');

    const total = await Lead.countDocuments();
    const noCalifican = await Lead.countDocuments({ status: 'No califica' });
    const calificados = await Lead.countDocuments({ lead_type: { $in: ['Ideal', 'Scale'] }, status: { $nin: ['No califica', 'sold'] } });
    const vendidos = await Lead.countDocuments({ status: 'sold' });
    const conTipo = await Lead.countDocuments({ lead_type: { $in: ['Ideal', 'Scale'] } });

    console.log('\n📊 RESUMEN:');
    console.log('   Total en BD:', total);
    console.log('   No califican:', noCalifican);
    console.log('   Calificados (activos):', calificados);
    console.log('   Vendidos:', vendidos);
    console.log('   ✅ Total sistema (con tipo Ideal/Scale):', conTipo);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanAndSeed();
