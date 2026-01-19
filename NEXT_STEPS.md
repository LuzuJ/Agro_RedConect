# 🚀 Pasos para Ejecutar la App con Modelo YOLOv8 Real

## ✅ Completado

1. ✅ Instalado `react-native-fast-tflite`
2. ✅ Actualizado `DetectionService.ts` con inferencia real
3. ✅ Configuración de parámetros validados (conf: 0.35, iou: 0.6)

## 📋 Próximos Pasos

### Paso 1: Generar Código Nativo (Prebuild)

```bash
cd mobile
npx expo prebuild
```

**Qué hace:**
- Genera carpetas `android/` e `ios/`
- Configura dependencias nativas de TFLite
- Prepara el proyecto para compilación nativa

**Tiempo estimado:** 2-3 minutos

---

### Paso 2: Ejecutar en Android

```bash
# Conecta tu celular Android por USB
# Activa "Depuración USB" en Opciones de Desarrollador

npx expo run:android
```

**O para iOS:**
```bash
npx expo run:ios
```

**Qué hace:**
- Compila la app nativa
- Instala en tu dispositivo
- Ejecuta el modelo TFLite real

**Tiempo estimado:** 5-10 minutos (primera vez)

---

### Paso 3: Probar la Detección

1. **Abre la app** en tu celular
2. **Captura una foto** de una mazorca de cacao
3. **Espera el análisis** (2-5ms por inferencia)
4. **Verifica:**
   - ✅ Vibración si detecta enfermedad
   - ✅ Recuadro verde (Sano) o rojo (Monilia/Fitoftora)
   - ✅ Navegación a TreatmentScreen
   - ✅ Confianza mostrada (ej: "Monilia 87%")

---

## 🐛 Solución de Problemas

### Error: "TFLite model not found"

**Solución:**
```bash
# Asegúrate de que el modelo existe
ls assets/models/best_int8.tflite

# Si no existe, cópialo:
cp ../modelo_predictivo/best_int8.tflite assets/models/
```

---

### Error: "Gradle build failed"

**Solución:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

### Error: "Pod install failed" (iOS)

**Solución:**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

---

### La inferencia es muy lenta (>100ms)

**Verificar:**
1. ¿Estás en modo Debug? → Prueba en Release:
   ```bash
   npx expo run:android --variant release
   ```

2. ¿El dispositivo es muy antiguo? → Reduce inputSize:
   ```typescript
   // En modelConfig.ts
   inputSize: 416, // En lugar de 640
   ```

---

## 📊 Monitoreo de Rendimiento

Agrega logs para verificar velocidad:

```typescript
// En DetectionService.ts
async detectFromImage(imageUri: string): Promise<DetectionResult> {
  const startTime = Date.now();
  
  // ... código de detección ...
  
  const endTime = Date.now();
  console.log(`⚡ Inferencia completada en ${endTime - startTime}ms`);
}
```

**Tiempos esperados:**
- Dispositivo gama alta: 2-5ms
- Dispositivo gama media: 5-15ms
- Dispositivo gama baja: 15-50ms

---

## 🎯 Siguientes Features (Después del MVP)

### 1. Modo Tiempo Real Funcional
Actualmente comentado. Habilitar cuando el modelo esté funcionando:

```typescript
// En CameraScreen.tsx
// Descomentar la sección de detectedBoxes
// Implementar callback de frame processing
```

### 2. Caché de Resultados
Guardar detecciones para offline:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('last_detection', JSON.stringify(result));
```

### 3. Analytics
Monitorear uso del modelo:

```typescript
analytics.logEvent('detection_completed', {
  disease: result.dominantDisease,
  confidence: result.boxes[0].confidence,
  device: Platform.OS,
});
```

### 4. Actualización OTA del Modelo
Cuando mejores el modelo, actualízalo sin nueva versión de la app:

```typescript
// Descargar modelo actualizado
const newModel = await downloadModel('https://api.agrocacao.com/models/latest');
await saveModel(newModel);
```

---

## 🔧 Configuración Avanzada

### Optimizar para Dispositivos Específicos

```typescript
// En modelConfig.ts
import { Platform } from 'react-native';

export const MODEL_CONFIG = {
  // Ajustar según capacidades del dispositivo
  inputSize: Platform.select({
    ios: 640,
    android: 640, // Reducir a 416 si hay problemas
  }),
  
  // Más threads en dispositivos potentes
  numThreads: Platform.select({
    ios: 4,
    android: 2,
  }),
};
```

---

## 📱 Build para Producción

Cuando estés listo para lanzar:

### Android (Google Play)

```bash
# 1. Generar APK firmado
eas build --platform android --profile production

# 2. O AAB para Play Store
eas build --platform android --profile production:aab
```

### iOS (App Store)

```bash
eas build --platform ios --profile production
```

---

## ✨ Validación Final

Antes de lanzar, verifica:

- [ ] Detección funciona en diferentes condiciones de luz
- [ ] Vibración se siente correctamente
- [ ] Navegación es fluida
- [ ] No hay crashes en 10+ detecciones consecutivas
- [ ] Batería no se drena excesivamente
- [ ] Funciona en dispositivos de gama baja (test con Android 8+)

---

## 🎉 ¡Listo para Lanzar!

Una vez que todo funcione:
1. Actualiza versión en `app.json` → `1.0.0`
2. Genera screenshots para las tiendas
3. Escribe descripción de la app
4. Sube a Google Play / App Store

**Tiempo total desde ahora hasta producción:** 1-2 días de testing.

---

## 📞 Soporte

Si algo no funciona:
1. Revisa logs: `npx react-native log-android` o `log-ios`
2. Verifica que el modelo está en `assets/models/`
3. Asegúrate de que prebuild se completó sin errores
