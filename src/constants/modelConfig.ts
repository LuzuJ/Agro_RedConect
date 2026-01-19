/**
 * Configuración FINAL para AgroCacao AI
 * Basada en análisis forense del modelo (best.pt) y curvas F1
 * Estos valores están calibrados matemáticamente para máximo rendimiento
 */

export const MODEL_CONFIG = {
  // ===== PARÁMETROS DE INFERENCIA =====
  // Umbral de confianza óptimo según curva F1
  // <0.35 = ruido, >0.45 = pierdes detecciones válidas
  confidenceThreshold: 0.35,
  
  // Umbral de IoU para NMS (Non-Maximum Suppression)
  // Maneja correctamente racimos de cacao y evita cajas duplicadas
  iouThreshold: 0.60,
  
  // CORREGIDO: 640x640 (tamaño nativo del modelo)
  // El modelo fue entrenado y exportado con este tamaño
  inputSize: 640,
  
  // Modelo TFLite (best_int8.tflite)
  // CORREGIDO: false = modelo usa float32 (no INT8 quantized)
  // A pesar del nombre "int8" en el archivo, usa float32 internamente
  quantized: false,
  
  // ===== RENDIMIENTO Y ESTABILIDAD =====
  // OPTIMIZADO: 1 hilo para evitar sobrecalentamiento en gama baja
  numThreads: 1,
  
  // OPTIMIZADO: 300ms (~3.3 FPS) reduce consumo de batería y CPU
  // UI seguirá fluida (60 FPS) pero IA trabaja menos
  throttleDurationMs: 300,
  
  // Buffer de persistencia: Frames consecutivos requeridos para confirmar detección
  // Elimina parpadeos y falsos positivos que duran milisegundos
  minFramesForTrigger: 3,
  
  // Umbral de confianza para disparo automático de foto
  autoCaptureConfidence: 0.65,
  
  // Usar GPU (desactivado, int8 corre mejor en CPU en Android)
  useGpu: false,
  
  // Ruta del modelo
  modelPath: require('../../assets/models/best_int8.tflite'),
  
  // ===== CLASES Y ETIQUETAS =====
  // Etiquetas de clases (orden según metadata.yaml)
  labels: ['Sano', 'Monilia', 'Fitoftora'],
} as const;

export type ModelLabel = typeof MODEL_CONFIG.labels[number];

/**
 * Sistema de Semáforo para Diagnóstico
 * 🔴 Rojo: Acción inmediata (Cortar mazorca)
 * 🟢 Verde: Todo bien
 */
export const LABEL_COLORS = {
  Sano: '#34C759',      // 🟢 Verde - No acción requerida
  Monilia: '#FF3B30',   // 🔴 Rojo - PELIGRO: Cortar inmediatamente
  Fitoftora: '#FF3B30', // 🔴 Rojo - PELIGRO: Cortar inmediatamente
} as const;

/**
 * Niveles de urgencia para UX
 */
export const DISEASE_SEVERITY = {
  Sano: {
    level: 'success' as const,
    action: 'Ninguna',
    emoji: '✅',
    message: 'Mazorca saludable',
  },
  Monilia: {
    level: 'danger' as const,
    action: 'CORTAR Y ENTERRAR',
    emoji: '🔴',
    message: 'PELIGRO: MONILIA DETECTADA',
  },
  Fitoftora: {
    level: 'danger' as const,
    action: 'CORTAR Y ENTERRAR',
    emoji: '🔴',
    message: 'PELIGRO: FITÓFTORA DETECTADA',
  },
} as const;

/**
 * Configuración de feedback háptico por clase
 */
export const HAPTIC_CONFIG = {
  Sano: { enabled: false },
  Monilia: { enabled: true, type: 'warning' as const },
  Fitoftora: { enabled: true, type: 'warning' as const },
} as const;
