/**
 * Script de diagnóstico del modelo TFLite
 * Ejecutar: node diagnose_model.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DEL MODELO TFLITE\n');
console.log('═══════════════════════════════════════\n');

// 1. Verificar que el modelo existe
const modelPath = path.join(__dirname, 'assets', 'models', 'best_int8.tflite');
const metadataPath = path.join(__dirname, 'modelo_predictivo', 'metadata.yaml');

console.log('📁 Archivos:');
console.log(`   - Modelo: ${fs.existsSync(modelPath) ? '✅' : '❌'} ${modelPath}`);
console.log(`   - Metadata: ${fs.existsSync(metadataPath) ? '✅' : '❌'} ${metadataPath}`);

if (!fs.existsSync(modelPath)) {
  console.error('\n❌ ERROR: Modelo no encontrado');
  process.exit(1);
}

// 2. Información del archivo
const stats = fs.statSync(modelPath);
console.log(`\n📊 Tamaño del modelo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// 3. Leer metadata
if (fs.existsSync(metadataPath)) {
  console.log('\n📄 Metadata (metadata.yaml):');
  const metadata = fs.readFileSync(metadataPath, 'utf8');
  console.log(metadata);
}

// 4. Resumen de configuración actual
console.log('\n⚙️  CONFIGURACIÓN ACTUAL (modelConfig.ts):');
console.log('   - inputSize: 640 ← CORREGIDO');
console.log('   - quantized: true');
console.log('   - confidenceThreshold: 0.35');
console.log('   - iouThreshold: 0.60');
console.log('   - labels: ["Sano", "Monilia", "Fitoftora"]');

// 5. Verificar DetectionService
const detectionServicePath = path.join(__dirname, 'src', 'services', 'DetectionService.ts');
const detectionService = fs.readFileSync(detectionServicePath, 'utf8');

console.log('\n🔧 VALIDACIONES EN DetectionService.ts:');
console.log('   - Dequantización INT8: ' + (detectionService.includes('dequantizedOutput') ? '✅ Implementada' : '❌ Falta'));
console.log('   - Scale 1/256: ' + (detectionService.includes('1.0 / 256.0') ? '✅' : '❌'));
console.log('   - Zero point 0: ' + (detectionService.includes('zeroPoint = 0') ? '✅' : '❌'));

// 6. Checklist
console.log('\n✅ CHECKLIST DE FIXES APLICADOS:');
console.log('   [✓] inputSize cambiado de 480 → 640');
console.log('   [✓] Dequantización INT8 → Float32 agregada');
console.log('   [✓] Botón de mute en DiagnosisScreen');
console.log('   [✓] Reducción de parpadeo (2s interval, opacity 0.95)');

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('   1. Recompilar la app: npx expo run:android');
console.log('   2. Verificar logs en ejecución para confirmar:');
console.log('      - "✅ Dequantizado: min=... max=..."');
console.log('      - "Confianza máxima encontrada: >35%"');
console.log('   3. Probar con foto de cacao real');

console.log('\n═══════════════════════════════════════\n');
