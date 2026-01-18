/**
 * Script para crear consultores de ejemplo con horarios disponibles
 * Uso: cd backend && node seed-consultants.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Consultant = require('./models/Consultant');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivenads';

async function seedConsultants() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // Crear consultores de ejemplo
    const consultants = [
      {
        name: 'Dr. Juan García',
        email: 'juan.garcia@stivenads.com',
        phone: '+34 612 345 678',
        specialization: 'Marketing Digital',
        bio: 'Especialista en estrategia digital con 10 años de experiencia',
        profileImage: 'https://via.placeholder.com/150',
        googleCalendarEmail: 'juan@gmail.com',
        availability: new Map([
          ['monday', [
            { startTime: '09:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '14:00', endTime: '18:00', durationMinutes: 60 }
          ]],
          ['tuesday', [
            { startTime: '09:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '14:00', endTime: '18:00', durationMinutes: 60 }
          ]],
          ['wednesday', [
            { startTime: '09:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '14:00', endTime: '18:00', durationMinutes: 60 }
          ]],
          ['thursday', [
            { startTime: '09:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '14:00', endTime: '18:00', durationMinutes: 60 }
          ]],
          ['friday', [
            { startTime: '09:00', endTime: '13:00', durationMinutes: 60 }
          ]],
          ['saturday', []],
          ['sunday', []]
        ]),
        breakTime: {
          startTime: '12:00',
          endTime: '14:00'
        },
        isActive: true
      },
      {
        name: 'Lic. María López',
        email: 'maria.lopez@stivenads.com',
        phone: '+34 623 456 789',
        specialization: 'Ventas B2B',
        bio: 'Experta en procesos de ventas y negociación comercial',
        profileImage: 'https://via.placeholder.com/150',
        googleCalendarEmail: 'maria@gmail.com',
        availability: new Map([
          ['monday', []],
          ['tuesday', [
            { startTime: '10:00', endTime: '13:00', durationMinutes: 60 },
            { startTime: '15:00', endTime: '19:00', durationMinutes: 60 }
          ]],
          ['wednesday', [
            { startTime: '10:00', endTime: '13:00', durationMinutes: 60 },
            { startTime: '15:00', endTime: '19:00', durationMinutes: 60 }
          ]],
          ['thursday', [
            { startTime: '10:00', endTime: '13:00', durationMinutes: 60 },
            { startTime: '15:00', endTime: '19:00', durationMinutes: 60 }
          ]],
          ['friday', [
            { startTime: '10:00', endTime: '13:00', durationMinutes: 60 }
          ]],
          ['saturday', [
            { startTime: '10:00', endTime: '13:00', durationMinutes: 60 }
          ]],
          ['sunday', []]
        ]),
        breakTime: {
          startTime: '13:00',
          endTime: '15:00'
        },
        isActive: true
      },
      {
        name: 'Ing. Carlos Rodríguez',
        email: 'carlos.rodriguez@stivenads.com',
        phone: '+34 634 567 890',
        specialization: 'Transformación Digital',
        bio: 'Especialista en implementación de soluciones tecnológicas',
        profileImage: 'https://via.placeholder.com/150',
        googleCalendarEmail: 'carlos@gmail.com',
        availability: new Map([
          ['monday', [
            { startTime: '08:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '13:00', endTime: '17:00', durationMinutes: 60 }
          ]],
          ['tuesday', [
            { startTime: '08:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '13:00', endTime: '17:00', durationMinutes: 60 }
          ]],
          ['wednesday', [
            { startTime: '08:00', endTime: '12:00', durationMinutes: 60 },
            { startTime: '13:00', endTime: '17:00', durationMinutes: 60 }
          ]],
          ['thursday', [
            { startTime: '08:00', endTime: '12:00', durationMinutes: 60 }
          ]],
          ['friday', []],
          ['saturday', []],
          ['sunday', []]
        ]),
        breakTime: {
          startTime: '12:00',
          endTime: '13:00'
        },
        isActive: true
      }
    ];

    // Insertar consultores
    const createdConsultants = await Consultant.insertMany(consultants);
    console.log(`✅ ${createdConsultants.length} consultores creados:\n`);
    
    createdConsultants.forEach(consultant => {
      console.log(`   📋 ${consultant.name}`);
      console.log(`      Email: ${consultant.email}`);
      console.log(`      Especialización: ${consultant.specialization}`);
      console.log(`      ID: ${consultant._id}`);
      console.log();
    });

    console.log('✅ Seed de consultores completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedConsultants();
