# AgroCacao IA - Mobile App

Aplicación móvil para diagnóstico de enfermedades de cacao usando YOLOv8 y React Native + Expo.

## 🚀 Inicio Rápido con Expo Go

1. **Instala Expo Go en tu celular:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Instala dependencias:**

   ```bash
   cd mobile
   npm install --legacy-peer-deps
   ```

3. **Inicia el servidor de desarrollo:**

   ```bash
   npx expo start
   ```

4. **Escanea el código QR:**
   - Android: Usa la app de Expo Go directamente
   - iOS: Usa la cámara del iPhone y abre con Expo Go

## 📱 Características Implementadas

- ✅ **SplashScreen**: Pantalla de bienvenida animada (3s)
- ✅ **CameraScreen**: Acceso real a la cámara + detección en tiempo real
- ✅ **DiagnosisScreen**: Visualización de resultados con foto capturada
- ✅ **TreatmentScreen**: Recetas de tratamiento (Inmediato/Biológico/Químico)
- ✅ **HeatmapScreen**: Mapa de plagas con geolocalización
- ✅ **Detección IA**: Integración con modelo YOLOv8 TFLite (simulado)
- ✅ **Vibración**: Haptics al detectar enfermedades
- ✅ **Recuadros Dinámicos**: Verde (Sano), Rojo (Monilia/Fitoftora)

## 🧠 Modelo de IA

### Parámetros Validados

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `confidenceThreshold` | 0.35 | Pico de la curva F1 |
| `iouThreshold` | 0.60 | Evita recuadros superpuestos |
| `inputSize` | 640x640 | Tamaño de entrenamiento |
| `quantization` | true (int8) | Modelo optimizado para móviles |
| `frameSkip` | 3 | Procesa 1 de cada 3 frames |

### Enfermedades Detectadas

1. **Sano**: Recuadro verde, vibración suave
2. **Monilia**: Recuadro rojo, vibración fuerte, navegación automática a tratamiento
3. **Fitoftora**: Recuadro rojo, vibración fuerte, navegación automática a tratamiento

## 🎨 Stack Tecnológico

- React Native + Expo SDK 54
- TypeScript
- expo-camera (cámara nativa + detección tiempo real)
- expo-location (geolocalización)
- expo-haptics (vibración táctil)
- expo-image-manipulator (conversión a JPG)
- @expo/vector-icons (iconos Material Community)
- @tensorflow/tfjs + expo-gl (inferencia IA - próximamente)

## 📋 Permisos Requeridos

- **Cámara**: Para escanear mazorcas en tiempo real
- **Ubicación**: Para mostrar alertas de plagas cercanas
- **Galería**: Para guardar fotos de diagnóstico
- **Vibración**: Para notificaciones hápticas

Todos configurados en [app.json](./app.json).

## 🔄 Flujo de la App

```
Splash (3s) → Camera → Diagnosis → Treatment
                ↓
              Heatmap (navegación inferior)
```

1. **SplashScreen**: Animación de bienvenida
2. **CameraScreen**: 
   - Modo foto: Captura + análisis
   - Modo tiempo real: Detección continua con recuadros
3. **DiagnosisScreen**: Resultados + confianza
4. **TreatmentScreen**: Recetas según enfermedad detectada
5. **HeatmapScreen**: Mapa con alertas georreferenciadas

## 🚧 Integración del Modelo TFLite

**Estado**: Lógica implementada, modelo simulado.

Para integrar el modelo real `best_int8.tflite`, consulta [MODEL_INTEGRATION.md](./MODEL_INTEGRATION.md).

**Opción recomendada**: 
```bash
npx expo install react-native-fast-tflite
npx expo prebuild
```

## 📁 Estructura del Proyecto

```
mobile/
├── App.tsx                     # Navegación principal
├── app.json                    # Config Expo + permisos
├── assets/models/
│   ├── best_int8.tflite        # Modelo YOLOv8
│   └── labels.txt              # Sano, Monilia, Fitoftora
├── src/
│   ├── screens/                # 5 pantallas
│   ├── services/
│   │   └── DetectionService.ts # Lógica de inferencia
│   └── constants/
│       ├── colors.ts           # Paleta
│       └── modelConfig.ts      # Parámetros IA
└── MODEL_INTEGRATION.md        # Guía TFLite
```

## 🧪 Testing

1. Ejecuta `npx expo start`
2. Escanea QR con Expo Go
3. Prueba:
   - Captura de foto
   - Botón tiempo real (target icon)
   - Vibración al detectar enfermedad
   - Navegación entre pantallas
   - Mapa de plagas

## 🔧 Troubleshooting

**Error de peer dependencies:**
```bash
npm install --legacy-peer-deps
```

**Expo dev server no inicia:**
```bash
npx expo start -c  # Limpiar cache
```

**Google Maps no aparece:**
Agrega tu API key en `app.json` → `config.googleMaps.apiKey`

## 📄 Licencia

AGPL-3.0 (Modelo YOLOv8 de Ultralytics)

- [ ] Integrar modelo TensorFlow Lite para detección real
- [x] Implementar TreatmentScreen con tabs
- [x] Agregar HeatmapScreen con lista de detecciones
- [x] Guardar historial de detecciones con AsyncStorage
- [x] Modo offline con caché local

## 📝 Notas

- Por ahora la detección es simulada (siempre detecta "Monilia 98%")
- El modelo TFLite está en `assets/models/best_int8.tflite`
- Colores basados en el diseño web original
- Textos 100% en español

## 🐛 Solución de Problemas

Si tienes errores al instalar dependencias:
```bash
npx expo install --fix
```

Si la app no carga en Expo Go:
- Asegúrate de estar en la misma red WiFi
- Reinicia el servidor con `r` en la terminal
- Cierra y abre Expo Go de nuevo
