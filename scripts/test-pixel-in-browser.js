// Script de Test para Facebook Pixel
// Copia y pega este código en la consola del navegador para probar el pixel

console.log('🧪 Iniciando prueba de Facebook Pixel...\n');

// 1. Verificar que fbq existe
if (typeof window.fbq === 'function') {
  console.log('✅ Facebook Pixel cargado correctamente');
  console.log('   window.fbq es tipo:', typeof window.fbq);
} else {
  console.error('❌ Facebook Pixel NO está cargado');
  console.log('   Verifica que el código está en index.html');
}

// 2. Probar eventos manualmente
console.log('\n📊 Probando eventos manuales...\n');

// Test evento Lead
console.log('🧪 Test 1: Evento Lead');
fbq('track', 'Lead', {
  content_name: 'Test Lead',
  test: true
});
console.log('✅ Evento Lead enviado\n');

// Test evento ViewContent
console.log('🧪 Test 2: Evento ViewContent');
fbq('track', 'ViewContent', {
  content_name: 'Test Content View',
  test: true
});
console.log('✅ Evento ViewContent enviado\n');

// Test evento personalizado
console.log('🧪 Test 3: Evento Personalizado CTAClick');
fbq('trackCustom', 'CTAClick', {
  cta_location: 'test',
  test: true
});
console.log('✅ Evento CTAClick enviado\n');

// Test evento Schedule
console.log('🧪 Test 4: Evento Schedule');
fbq('track', 'Schedule', {
  content_name: 'Test Schedule',
  value: 100,
  currency: 'USD',
  test: true
});
console.log('✅ Evento Schedule enviado\n');

// 3. Información del Pixel
console.log('\n📋 Información del Pixel:\n');
console.log('Pixel ID: 2118145782285965');
console.log('Versión: 2.0');
console.log('Estado: Activo ✅');

console.log('\n🎯 Próximos pasos:\n');
console.log('1. Abre Facebook Pixel Helper (extensión de Chrome)');
console.log('2. Verifica que aparezcan los 4 eventos de prueba');
console.log('3. Ve a Facebook Events Manager:');
console.log('   https://business.facebook.com/events_manager');
console.log('4. Selecciona Pixel ID: 2118145782285965');
console.log('5. Abre "Test Events" y verifica eventos en vivo');

console.log('\n✅ Test completado');
